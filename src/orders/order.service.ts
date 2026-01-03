import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { CreateOrderDTO } from "./dto/create-order.dto";
import { UpdateOrderDTO } from "./dto/update-order.dto";
import { OrderPaginationDTO } from "./dto/order-pagination.dto";
import { OrderResponseDTO } from "./dto/order-response.dto";
import { IPaginationOptions, paginate, Pagination } from "nestjs-typeorm-paginate";
import { plainToInstance } from "class-transformer";
import { 
    OrderNotFoundException, 
    InvalidOrderStatusException, 
    EmptyOrderException, 
    InvalidQuantityException,
    MenuItemNotAvailableForOrderException,
    DriverNotAvailableException,
    RestaurantNotActiveException,
    OrderAlreadyCancelledException,
    OrderAlreadyDeliveredException
} from "src/common/exceptions/order.exceptions";
import { RestaurantNotFoundException } from "src/common/exceptions/restaurant.exceptions";
import { CustomerNotFoundException } from "src/common/exceptions/customer.exceptions";
import { DriverNotFoundException } from "src/common/exceptions/driver.exceptions";
import { MenuItem } from "src/resturants/entities/menu-item.entity";
import { Restaurant } from "src/resturants/entities/restaurant.entity";
import { Customer } from "src/users/entities/user.entity";
import { DeliveryDriver } from "src/drivers/entities/driver.entity";
import { RabbitMQService } from "src/rabbitmq/rabbitmq.service";
import { OrderPlacementEvent } from "./events/order-placed.event";

@Injectable()
export class OrderService {

    private readonly log = new Logger(OrderService.name);

    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(MenuItem)
        private menuItemRepository: Repository<MenuItem>,
        @InjectRepository(Restaurant)
        private restaurantRepository: Repository<Restaurant>,
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
        @InjectRepository(DeliveryDriver)
        private driverRepository: Repository<DeliveryDriver>,
        private rabbitMQService: RabbitMQService
    ) {}

    async findAll(query: OrderPaginationDTO): Promise<Pagination<OrderResponseDTO>> {
        
        const { page, limit, status, customer_id, restaurant_id, driver_id, sortBy, sortOrder } = query;

        const queryBuilder = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.orderItems', 'orderItems');

        if (status) {
            queryBuilder.andWhere('order.status = :status', { status });
        }

        if (customer_id) {
            queryBuilder.andWhere('order.customer_id = :customer_id', { customer_id });
        }

        if (restaurant_id) {
            queryBuilder.andWhere('order.restaurant_id = :restaurant_id', { restaurant_id });
        }

        if (driver_id) {
            queryBuilder.andWhere('order.driver_id = :driver_id', { driver_id });
        }

        if (sortBy && sortOrder) {
            queryBuilder.orderBy(`order.${sortBy}`, sortOrder);
        } else {
            queryBuilder.orderBy('order.order_date', 'DESC');
        }

        const paginationOption: IPaginationOptions = {
            page,
            limit
        };

        const result = await paginate<Order>(queryBuilder, paginationOption);

        return {
            items: plainToInstance(OrderResponseDTO, result.items),
            meta: result.meta,
            links: result.links
        };
    }

    async findById(id: string): Promise<OrderResponseDTO> {

        const order = await this.orderRepository.findOne({
            where: { id: id },
            relations: ['orderItems']
        });

        if (!order) {
            throw new OrderNotFoundException(id);
        }

        return new OrderResponseDTO(order);
    }

    async create(createDto: CreateOrderDTO, customerId: string): Promise<OrderResponseDTO> {

        // Set customer_id from authenticated user
        createDto.customer_id = customerId;

        // Validate customer exists
        const customer = await this.customerRepository.findOne({
            where: { id: createDto.customer_id }
        });

        if (!customer) {
            throw new CustomerNotFoundException(createDto.customer_id);
        }

        // Validate restaurant exists and is active
        const restaurant = await this.restaurantRepository.findOne({
            where: { id: createDto.restaurant_id }
        });

        if (!restaurant) {
            throw new RestaurantNotFoundException(createDto.restaurant_id);
        }

        if (!restaurant.is_active) {
            throw new RestaurantNotActiveException(createDto.restaurant_id);
        }

        // Validate order has items
        if (!createDto.items || createDto.items.length === 0) {
            throw new EmptyOrderException();
        }

        // Validate all menu items exist, are available, and belong to the restaurant
        let totalAmount = 0;
        const orderItemsData: Array<{
            menu_item_id: string;
            quantity: number;
            unit_price: number;
            subtotal: number;
        }> = [];

        for (const item of createDto.items) {
            if (item.quantity < 1) {
                throw new InvalidQuantityException('Quantity must be at least 1');
            }

            const menuItem = await this.menuItemRepository.findOne({
                where: { id: item.menu_item_id }
            });

            if (!menuItem) {
                throw new RestaurantNotFoundException(item.menu_item_id);
            }

            if (!menuItem.is_available) {
                throw new MenuItemNotAvailableForOrderException(item.menu_item_id);
            }

            if (menuItem.restaurant_id !== createDto.restaurant_id) {
                throw new InvalidOrderStatusException(
                    'creation',
                    'Menu item does not belong to the specified restaurant'
                );
            }

            const subtotal = Number(menuItem.price) * item.quantity;
            totalAmount += subtotal;

            orderItemsData.push({
                menu_item_id: item.menu_item_id,
                quantity: item.quantity,
                unit_price: Number(menuItem.price),
                subtotal: subtotal
            });
        }

        // Create order
        const order = this.orderRepository.create({
            customer_id: createDto.customer_id,
            restaurant_id: createDto.restaurant_id,
            delivery_address: createDto.delivery_address,
            special_instructions: createDto.special_instructions,
            total_amount: totalAmount,
            status: OrderStatus.PENDING,
            order_date: new Date()
        });

        const savedOrder = await this.orderRepository.save(order);

        // Create order items
        const orderItems = orderItemsData.map(itemData => 
            this.orderItemRepository.create({
                menu_item_id: itemData.menu_item_id,
                quantity: itemData.quantity,
                unit_price: itemData.unit_price,
                subtotal: itemData.subtotal,
                order_id: savedOrder.id,
                created_at: new Date()
            })
        );

        await this.orderItemRepository.save(orderItems);

        // Fetch complete order with items
        const completeOrder = await this.orderRepository.findOne({
            where: { id: savedOrder.id },
            relations: ['orderItems']
        });

        if (!completeOrder) {
            throw new OrderNotFoundException(savedOrder.id);
        }

        const event = new OrderPlacementEvent({
            orderId: completeOrder.id,
            customerId: completeOrder.customer_id,
            restaurantId: completeOrder.restaurant_id,
            items: completeOrder.orderItems,
            totalAmount: completeOrder.total_amount,
            deliveryAddress: completeOrder.delivery_address
        });

        this.log.log("Event Made:", event);

        this.rabbitMQService.emitEvent('order.placed', event);

        this.log.log("Event published:", event.eventId);

        return new OrderResponseDTO(completeOrder);
    }

    async update(id: string, updateDto: UpdateOrderDTO): Promise<OrderResponseDTO> {

        const order = await this.orderRepository.findOne({
            where: { id: id },
            relations: ['orderItems']
        });

        if (!order) {
            throw new OrderNotFoundException(id);
        }

        // Check if order is already cancelled or delivered
        if (order.status === OrderStatus.CANCELLED) {
            throw new OrderAlreadyCancelledException(id);
        }

        if (order.status === OrderStatus.DELIVERED) {
            throw new OrderAlreadyDeliveredException(id);
        }

        // Validate status transition if status is being updated
        if (updateDto.status && updateDto.status !== order.status) {
            this.validateStatusTransition(order.status, updateDto.status);
        }

        // Validate driver if being assigned
        if (updateDto.driver_id) {
            const driver = await this.driverRepository.findOne({
                where: { id: updateDto.driver_id }
            });

            if (!driver) {
                throw new DriverNotFoundException(updateDto.driver_id);
            }

            if (!driver.is_available) {
                throw new DriverNotAvailableException(updateDto.driver_id);
            }
        }

        // Update order
        Object.assign(order, updateDto);
        order.updated_at = new Date();

        const savedOrder = await this.orderRepository.save(order);

        return new OrderResponseDTO(savedOrder);
    }

    async updateStatus(id: string, status: OrderStatus): Promise<OrderResponseDTO> {

        const order = await this.orderRepository.findOne({
            where: { id: id },
            relations: ['orderItems']
        });

        if (!order) {
            throw new OrderNotFoundException(id);
        }

        // Check if order is already cancelled or delivered
        if (order.status === OrderStatus.CANCELLED) {
            throw new OrderAlreadyCancelledException(id);
        }

        if (order.status === OrderStatus.DELIVERED && status !== OrderStatus.DELIVERED) {
            throw new OrderAlreadyDeliveredException(id);
        }

        // Validate status transition
        this.validateStatusTransition(order.status, status);

        order.status = status;
        order.updated_at = new Date();

        // Set estimated delivery time when order is confirmed
        if (status === OrderStatus.CONFIRMED && !order.estimated_delivery_time) {
            const estimatedTime = new Date();
            estimatedTime.setMinutes(estimatedTime.getMinutes() + 45); // Default 45 minutes
            order.estimated_delivery_time = estimatedTime;
        }

        const savedOrder = await this.orderRepository.save(order);
        return new OrderResponseDTO(savedOrder);
    }

    async assignDriver(orderId: string, driverId: string): Promise<OrderResponseDTO> {

        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['orderItems']
        });

        if (!order) {
            throw new OrderNotFoundException(orderId);
        }

        const driver = await this.driverRepository.findOne({
            where: { id: driverId }
        });

        if (!driver) {
            throw new DriverNotFoundException(driverId);
        }

        if (!driver.is_available) {
            throw new DriverNotAvailableException(driverId);
        }

        // Mark driver as unavailable
        driver.is_available = false;
        await this.driverRepository.save(driver);

        order.driver_id = driverId;
        order.updated_at = new Date();

        const savedOrder = await this.orderRepository.save(order);
        return new OrderResponseDTO(savedOrder);
    }

    async cancelOrder(id: string): Promise<OrderResponseDTO> {

        const order = await this.orderRepository.findOne({
            where: { id: id },
            relations: ['orderItems']
        });

        if (!order) {
            throw new OrderNotFoundException(id);
        }

        // Only pending, confirmed, and preparing orders can be cancelled
        const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING];
        
        if (!cancellableStatuses.includes(order.status)) {
            throw new InvalidOrderStatusException(
                order.status,
                'Orders can only be cancelled if they are pending, confirmed, or preparing'
            );
        }

        order.status = OrderStatus.CANCELLED;
        order.updated_at = new Date();

        const savedOrder = await this.orderRepository.save(order);

        return new OrderResponseDTO(savedOrder);
    }

    async remove(id: string): Promise<string> {

        const order = await this.orderRepository.findOne({
            where: { id: id }
        });

        if (!order) {
            throw new OrderNotFoundException(id);
        }

        await this.orderRepository.remove(order);
        return `Order ${id} removed successfully`;
    }

    async findByCustomer(customerId: string, query: OrderPaginationDTO): Promise<Pagination<OrderResponseDTO>> {
        
        const customer = await this.customerRepository.findOne({
            where: { id: customerId }
        });

        if (!customer) {
            throw new CustomerNotFoundException(customerId);
        }

        query.customer_id = customerId;
        return this.findAll(query);
    }

    async findByRestaurant(restaurantId: string, query: OrderPaginationDTO): Promise<Pagination<OrderResponseDTO>> {
        
        const restaurant = await this.restaurantRepository.findOne({
            where: { id: restaurantId }
        });

        if (!restaurant) {
            throw new RestaurantNotFoundException(restaurantId);
        }

        query.restaurant_id = restaurantId;
        return this.findAll(query);
    }

    async findByDriver(driverId: string, query: OrderPaginationDTO): Promise<Pagination<OrderResponseDTO>> {
        
        const driver = await this.driverRepository.findOne({
            where: { id: driverId }
        });

        if (!driver) {
            throw new DriverNotFoundException(driverId);
        }

        query.driver_id = driverId;
        return this.findAll(query);
    }

    async handleOrderDelivered(orderId: string): Promise<void> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['driver']
        });

        if (!order) {
            throw new OrderNotFoundException(orderId);
        }

        // Update order status to delivered
        order.status = OrderStatus.DELIVERED;
        order.updated_at = new Date();
        await this.orderRepository.save(order);

        // Mark driver as available again
        if (order.driver) {
            order.driver.is_available = true;
            await this.driverRepository.save(order.driver);
        }

        this.log.log(`Order ${orderId} marked as delivered, driver ${order.driver_id} is now available`);
    }

    private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
            [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
            [OrderStatus.READY]: [OrderStatus.PICKED_UP],
            [OrderStatus.PICKED_UP]: [OrderStatus.DELIVERED],
            [OrderStatus.DELIVERED]: [],
            [OrderStatus.CANCELLED]: []
        };

        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new InvalidOrderStatusException(currentStatus, newStatus);
        }
    }
}

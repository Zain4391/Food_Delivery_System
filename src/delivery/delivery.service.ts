import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Delivery } from "./entities/delivery.entity";
import { Order, OrderStatus } from "src/orders/entities/order.entity";
import { CreateDeliveryDTO } from "./dtos/create-delivery.dto";
import { UpdateDeliveryDTO } from "./dtos/update-delivery.dto";
import { DeliveryResponseDTO } from "./dtos/delivery-response.dto";
import { DeliveryPaginationDTO } from "./dtos/delivery-pagination.dto";
import { IPaginationOptions, paginate, Pagination } from "nestjs-typeorm-paginate";
import { plainToInstance } from "class-transformer";
import { 
    DeliveryNotFoundException, 
    DeliveryAlreadyExistsException,
    DeliveryAlreadyPickedUpException,
    DeliveryAlreadyDeliveredException,
    DeliveryNotPickedUpException
} from "src/common/exceptions/delivery.exceptions";
import { OrderNotFoundException } from "src/common/exceptions/order.exceptions";
import { RabbitMQService } from "src/rabbitmq/rabbitmq.service";
import { DeliveryDriver } from "src/drivers/entities/driver.entity";
import { OrderDeliveredEvent } from "../events/delivery/order-delivered.event";
import { OrderPickedUpEvent } from "../events/delivery/order-pickup.event";
import { DriverAssignedEvent } from "../events/delivery/driver-assigned.event";
import { OrderReadyEvent } from "src/events/restaurant/order-ready.event";

@Injectable()
export class DeliveryService {

    private readonly logger = new Logger(DeliveryService.name);

    constructor(
        @InjectRepository(Delivery)
        private deliveryRepository: Repository<Delivery>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(DeliveryDriver)
        private driverRepository: Repository<DeliveryDriver>,
        private readonly rabbitMQService: RabbitMQService
    ) {}

    async findAll(query: DeliveryPaginationDTO): Promise<Pagination<DeliveryResponseDTO>> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const sortBy = query.sortBy;
        const sortOrder = query.sortOrder ?? 'DESC';
        const order_id = query.order_id;

        const queryBuilder = this.deliveryRepository.createQueryBuilder('delivery');
        if (order_id) queryBuilder.where('delivery.order_id = :order_id', { order_id });
        if (sortBy) queryBuilder.orderBy(`delivery.${sortBy}`, sortOrder);
        else queryBuilder.orderBy('delivery.created_at', 'DESC');

        const result = await paginate<Delivery>(queryBuilder, { page, limit } as IPaginationOptions);
        return {
            items: plainToInstance(DeliveryResponseDTO, result.items),
            meta: result.meta,
            links: result.links
        };
    }

    async create(createDto: CreateDeliveryDTO): Promise<DeliveryResponseDTO> {
        const order = await this.orderRepository.findOne({ where: { id: createDto.order_id } });
        if (!order) throw new OrderNotFoundException(createDto.order_id);

        const existingDelivery = await this.deliveryRepository.findOne({ where: { order_id: createDto.order_id } });
        if (existingDelivery) throw new DeliveryAlreadyExistsException(createDto.order_id);

        const delivery = this.deliveryRepository.create({ order_id: createDto.order_id, created_at: new Date() });
        return new DeliveryResponseDTO(await this.deliveryRepository.save(delivery));
    }

    async findById(id: string): Promise<DeliveryResponseDTO> {
        const delivery = await this.deliveryRepository.findOne({ where: { id } });
        if (!delivery) throw new DeliveryNotFoundException(id);
        return new DeliveryResponseDTO(delivery);
    }

    async findByOrderId(orderId: string): Promise<DeliveryResponseDTO> {
        const delivery = await this.deliveryRepository.findOne({ where: { order_id: orderId } });
        if (!delivery) throw new DeliveryNotFoundException(`order ${orderId}`);
        return new DeliveryResponseDTO(delivery);
    }

    async update(id: string, updateDto: UpdateDeliveryDTO): Promise<DeliveryResponseDTO> {
        const delivery = await this.deliveryRepository.findOne({ where: { id } });
        if (!delivery) throw new DeliveryNotFoundException(id);
        Object.assign(delivery, updateDto);
        delivery.updated_at = new Date();
        return new DeliveryResponseDTO(await this.deliveryRepository.save(delivery));
    }

    async markAsPickedUp(id: string): Promise<DeliveryResponseDTO> {
        const delivery = await this.deliveryRepository.findOne({ where: { id } });
        if (!delivery) throw new DeliveryNotFoundException(id);
        if (delivery.picked_up_at) throw new DeliveryAlreadyPickedUpException(id);
        if (delivery.delivered_at) throw new DeliveryAlreadyDeliveredException(id);

        delivery.picked_up_at = new Date();
        delivery.updated_at = new Date();
        const savedDelivery = await this.deliveryRepository.save(delivery);

        // Update order status to picked_up immediately
        const order = await this.orderRepository.findOne({
            where: { id: savedDelivery.order_id },
            relations: ['driver']
        });
        if (order) {
            order.status = OrderStatus.PICKED_UP;
            order.updated_at = new Date();
            await this.orderRepository.save(order);

            const pickupEvent = new OrderPickedUpEvent({
                orderId: order.id,
                driverId: order.driver_id,
                customerId: order.customer_id
            });
            this.rabbitMQService.emitEvent('order.picked.up', pickupEvent);
            this.logger.log(`Emitted order.picked.up for order: ${order.id}`);
        }

        return new DeliveryResponseDTO(savedDelivery);
    }

    async markAsDelivered(id: string): Promise<DeliveryResponseDTO> {
        const delivery = await this.deliveryRepository.findOne({ where: { id } });
        if (!delivery) throw new DeliveryNotFoundException(id);
        if (!delivery.picked_up_at) throw new DeliveryNotPickedUpException(id);
        if (delivery.delivered_at) throw new DeliveryAlreadyDeliveredException(id);

        delivery.delivered_at = new Date();
        delivery.updated_at = new Date();
        const savedDelivery = await this.deliveryRepository.save(delivery);

        const order = await this.orderRepository.findOne({
            where: { id: savedDelivery.order_id },
            relations: ['driver']
        });
        if (order) {
            const deliveredEvent = new OrderDeliveredEvent({
                orderId: order.id,
                driverId: order.driver_id
            });
            this.rabbitMQService.emitEvent('order.delivered', deliveredEvent);
            this.logger.log(`Emitted order.delivered for order: ${order.id}`);
        }

        return new DeliveryResponseDTO(savedDelivery);
    }

    async remove(id: string): Promise<string> {
        const delivery = await this.deliveryRepository.findOne({ where: { id: id } });
        if (!delivery) throw new DeliveryNotFoundException(id);
        await this.deliveryRepository.remove(delivery);
        return `Delivery ${id} removed successfully`;
    }

    // ========== Event Handlers ==========

    async handleOrderReady(data: OrderReadyEvent): Promise<void> {
        this.logger.log(`Received order.ready event for order: ${data.orderId}`);

        const availableDriver = await this.driverRepository.findOne({ where: { is_available: true } });
        if (!availableDriver) {
            this.logger.warn(`No available drivers for order ${data.orderId}`);
            return;
        }

        const order = await this.orderRepository.findOne({ where: { id: data.orderId } });
        if (!order) {
            this.logger.error(`Order ${data.orderId} not found`);
            return;
        }

        // Assign driver
        order.driver_id = availableDriver.id;
        order.updated_at = new Date();
        await this.orderRepository.save(order);

        // Mark driver unavailable
        availableDriver.is_available = false;
        await this.driverRepository.save(availableDriver);

        // Create delivery record so the driver can act on it
        const existingDelivery = await this.deliveryRepository.findOne({ where: { order_id: order.id } });
        if (!existingDelivery) {
            const delivery = this.deliveryRepository.create({
                order_id: order.id,
                created_at: new Date()
            });
            await this.deliveryRepository.save(delivery);
            this.logger.log(`Created delivery record for order: ${order.id}`);
        }

        // Emit driver.assigned event
        const assignedEvent = new DriverAssignedEvent({
            orderId: order.id,
            driverId: availableDriver.id,
            driverName: availableDriver.name,
            driverPhone: availableDriver.phone,
        });
        this.rabbitMQService.emitEvent('driver.assigned', assignedEvent);
        this.logger.log(`Assigned driver ${availableDriver.id} to order ${data.orderId}`);
    }

    async handleOrderPickedUp(data: OrderPickedUpEvent): Promise<void> {
        this.logger.log(`Received order.picked.up event for order: ${data.orderId}`);
        // Status is already set to picked_up in markAsPickedUp — nothing more to do here
    }
}

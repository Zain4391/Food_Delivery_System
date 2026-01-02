import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Delivery } from "./entities/delivery.entity";
import { Order } from "src/orders/entities/order.entity";
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

@Injectable()
export class DeliveryService {

    constructor(
        @InjectRepository(Delivery)
        private deliveryRepository: Repository<Delivery>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>
    ) {}

    async findAll(query: DeliveryPaginationDTO): Promise<Pagination<DeliveryResponseDTO>> {
        
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const sortBy = query.sortBy;
        const sortOrder = query.sortOrder ?? 'DESC';
        const order_id = query.order_id;

        const queryBuilder = this.deliveryRepository.createQueryBuilder('delivery');

        if (order_id) {
            queryBuilder.where('delivery.order_id = :order_id', { order_id });
        }

        if (sortBy) {
            queryBuilder.orderBy(`delivery.${sortBy}`, sortOrder);
        } else {
            queryBuilder.orderBy('delivery.created_at', 'DESC');
        }

        const paginationOption: IPaginationOptions = {
            page: page,
            limit: limit
        };

        const result = await paginate<Delivery>(queryBuilder, paginationOption);

        return {
            items: plainToInstance(DeliveryResponseDTO, result.items),
            meta: result.meta,
            links: result.links
        };
    }

    async create(createDto: CreateDeliveryDTO): Promise<DeliveryResponseDTO> {

        // Validate order exists
        const order = await this.orderRepository.findOne({
            where: { id: createDto.order_id }
        });

        if (!order) {
            throw new OrderNotFoundException(createDto.order_id);
        }

        // Check if delivery already exists for this order
        const existingDelivery = await this.deliveryRepository.findOne({
            where: { order_id: createDto.order_id }
        });

        if (existingDelivery) {
            throw new DeliveryAlreadyExistsException(createDto.order_id);
        }

        const delivery = this.deliveryRepository.create({
            order_id: createDto.order_id,
            created_at: new Date()
        });

        const savedDelivery = await this.deliveryRepository.save(delivery);
        return new DeliveryResponseDTO(savedDelivery);
    }

    async findById(id: string): Promise<DeliveryResponseDTO> {

        const delivery = await this.deliveryRepository.findOne({
            where: { id: id }
        });

        if (!delivery) {
            throw new DeliveryNotFoundException(id);
        }

        return new DeliveryResponseDTO(delivery);
    }

    async findByOrderId(orderId: string): Promise<DeliveryResponseDTO> {

        const delivery = await this.deliveryRepository.findOne({
            where: { order_id: orderId }
        });

        if (!delivery) {
            throw new DeliveryNotFoundException(`order ${orderId}`);
        }

        return new DeliveryResponseDTO(delivery);
    }

    async update(id: string, updateDto: UpdateDeliveryDTO): Promise<DeliveryResponseDTO> {

        const delivery = await this.deliveryRepository.findOne({
            where: { id: id }
        });

        if (!delivery) {
            throw new DeliveryNotFoundException(id);
        }

        // Update delivery
        Object.assign(delivery, updateDto);
        delivery.updated_at = new Date();

        const savedDelivery = await this.deliveryRepository.save(delivery);
        return new DeliveryResponseDTO(savedDelivery);
    }

    async markAsPickedUp(id: string): Promise<DeliveryResponseDTO> {

        const delivery = await this.deliveryRepository.findOne({
            where: { id: id }
        });

        if (!delivery) {
            throw new DeliveryNotFoundException(id);
        }

        if (delivery.picked_up_at) {
            throw new DeliveryAlreadyPickedUpException(id);
        }

        if (delivery.delivered_at) {
            throw new DeliveryAlreadyDeliveredException(id);
        }

        delivery.picked_up_at = new Date();
        delivery.updated_at = new Date();

        const savedDelivery = await this.deliveryRepository.save(delivery);
        return new DeliveryResponseDTO(savedDelivery);
    }

    async markAsDelivered(id: string): Promise<DeliveryResponseDTO> {

        const delivery = await this.deliveryRepository.findOne({
            where: { id: id }
        });

        if (!delivery) {
            throw new DeliveryNotFoundException(id);
        }

        if (!delivery.picked_up_at) {
            throw new DeliveryNotPickedUpException(id);
        }

        if (delivery.delivered_at) {
            throw new DeliveryAlreadyDeliveredException(id);
        }

        delivery.delivered_at = new Date();
        delivery.updated_at = new Date();

        const savedDelivery = await this.deliveryRepository.save(delivery);
        return new DeliveryResponseDTO(savedDelivery);
    }

    async remove(id: string): Promise<string> {

        const delivery = await this.deliveryRepository.findOne({
            where: { id: id }
        });

        if (!delivery) {
            throw new DeliveryNotFoundException(id);
        }

        await this.deliveryRepository.remove(delivery);
        return `Delivery ${id} removed successfully`;
    }
}
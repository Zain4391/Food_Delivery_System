import { Exclude, Expose, Type } from "class-transformer";
import { OrderStatus } from "../entities/order.entity";

export class OrderItemResponseDTO {
    @Expose()
    id: string;

    @Expose()
    menu_item_id: string;

    @Expose()
    quantity: number;

    @Expose()
    unit_price: number;

    @Expose()
    subtotal: number;

    @Expose()
    created_at: Date;

    constructor(partial: Partial<OrderItemResponseDTO>) {
        Object.assign(this, partial);
    }
}

export class OrderResponseDTO {
    @Expose()
    id: string;

    @Expose()
    status: OrderStatus;

    @Expose()
    total_amount: number;

    @Expose()
    delivery_address: string;

    @Expose()
    special_instructions: string;

    @Expose()
    estimated_delivery_time: Date;

    @Expose()
    customer_id: string;

    @Expose()
    restaurant_id: string;

    @Expose()
    driver_id: string;

    @Expose()
    @Type(() => OrderItemResponseDTO)
    orderItems: OrderItemResponseDTO[];

    @Expose()
    order_date: Date;

    @Expose()
    updated_at: Date;

    constructor(partial: Partial<OrderResponseDTO>) {
        Object.assign(this, partial);
    }
}

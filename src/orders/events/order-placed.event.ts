import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { BaseEventDTO } from "src/common/events/base-event.dto";
import { OrderItemDTO } from "../dto/create-order.dto";

export class OrderPlacementEvent extends BaseEventDTO {

    @IsUUID()
    orderId: string;

    @IsUUID()
    customerId: string;

    @IsUUID()
    restaurantId: string;

    @IsString()
    deliveryAddress: string;

    @IsString()
    @IsOptional()
    specialInstruction?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDTO)
    items: OrderItemDTO[];

    @IsNumber()
    totalAmount: number;

    constructor(partial: Partial<OrderPlacementEvent>) {
        super();
        Object.assign(this, partial);
        this.eventType = 'order.placed';
    }
}
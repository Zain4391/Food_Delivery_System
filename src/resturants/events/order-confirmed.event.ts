import { IsDateString, IsUUID } from "class-validator";
import { BaseEventDTO } from "src/common/events/base-event.dto";

export class OrderConfirmedEvent extends BaseEventDTO {

    @IsUUID()
    orderId: string;

    @IsUUID()
    restaurantId: string;

    @IsDateString()
    estimatedDeliveryTime: string;

    constructor(partial: Partial<OrderConfirmedEvent>) {
        super();
        Object.assign(this, partial);
        this.eventType = 'order.confirmed';
    }
}
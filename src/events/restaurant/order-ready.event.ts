import { IsString, IsUUID } from "class-validator";
import { BaseEventDTO } from "src/common/events/base-event.dto";

export class OrderReadyEvent extends BaseEventDTO {

    @IsUUID()
    orderId: string;

    @IsUUID()
    restaurantId: string;

    @IsString()
    deliveryAddress: string;

    constructor(partial: Partial<OrderReadyEvent>) {
        super();
        Object.assign(this, partial);
        this.eventType = 'order.ready';
    }
}
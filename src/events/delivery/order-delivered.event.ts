import { IsDateString, IsUUID } from "class-validator";
import { BaseEventDTO } from "src/common/events/base-event.dto";

export class OrderDeliveredEvent extends BaseEventDTO {

  @IsUUID()
  orderId: string;

  @IsUUID()
  driverId: string;

  @IsDateString()
  deliveredAt: string;

  constructor(partial: Partial<OrderDeliveredEvent>) {
    super();
    Object.assign(this, partial);
    this.eventType = 'order.delivered';
    this.deliveredAt = new Date().toISOString();
  }
}
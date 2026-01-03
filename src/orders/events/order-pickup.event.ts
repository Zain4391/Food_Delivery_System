import { IsDateString, IsUUID } from "class-validator";
import { BaseEventDTO } from "src/common/events/base-event.dto";

export class OrderPickedUpEvent extends BaseEventDTO {

  @IsUUID()
  orderId: string;

  @IsUUID()
  driverId: string;

  @IsUUID()
  customerId: string;

  @IsDateString()
  pickedUpAt: string;

  constructor(partial: Partial<OrderPickedUpEvent>) {
    super();
    Object.assign(this, partial);
    this.eventType = 'order.picked.up';
    this.pickedUpAt = new Date().toISOString();
  }
}
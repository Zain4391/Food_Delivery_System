import { IsString, IsUUID, IsDateString } from 'class-validator';
import { BaseEventDTO } from 'src/common/events/base-event.dto';

export class DriverAssignedEvent extends BaseEventDTO {

  @IsUUID()
  orderId: string;

  @IsUUID()
  driverId: string;

  @IsString()
  driverName: string;

  @IsString()
  driverPhone: string;

  @IsDateString()
  estimatedDeliveryTime: string; 

  @IsDateString()
  assignedAt: string;

  constructor(partial: Partial<DriverAssignedEvent>) {
    super();
    Object.assign(this, partial);
    this.eventType = 'driver.assigned';
    this.assignedAt = new Date().toISOString();
  }
}
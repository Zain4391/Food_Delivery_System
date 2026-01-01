import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { OrderStatus } from "../entities/order.entity";

export class UpdateOrderDTO {

    @IsOptional()
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @IsOptional()
    @IsString()
    delivery_address: string;

    @IsOptional()
    @IsString()
    special_instructions: string;

    @IsOptional()
    @IsUUID()
    driver_id: string;
}

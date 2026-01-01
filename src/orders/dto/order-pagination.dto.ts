import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { OrderStatus } from "../entities/order.entity";

export class OrderPaginationDTO {

    @IsInt()
    @Min(1)
    page: number = 1;

    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10;

    @IsOptional()
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @IsOptional()
    @IsUUID()
    customer_id: string;

    @IsOptional()
    @IsUUID()
    restaurant_id: string;

    @IsOptional()
    @IsUUID()
    driver_id: string;

    @IsOptional()
    @IsString()
    @IsIn(['order_date', 'total_amount', 'status', 'updated_at'])
    sortBy: string;

    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    sortOrder: 'ASC' | 'DESC' = 'DESC';
}

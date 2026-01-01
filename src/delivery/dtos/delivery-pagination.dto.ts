import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class DeliveryPaginationDTO {

    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10;

    @IsOptional()
    @IsUUID()
    order_id: string;

    @IsOptional()
    @IsString()
    @IsIn(['created_at', 'picked_up_at', 'delivered_at', 'updated_at'])
    sortBy: string;

    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    sortOrder: 'ASC' | 'DESC' = 'DESC';
}

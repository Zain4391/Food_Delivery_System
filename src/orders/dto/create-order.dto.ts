import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested, ArrayMinSize, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class OrderItemDTO {

    @IsUUID()
    @IsNotEmpty()
    menu_item_id: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateOrderDTO {

    @IsUUID()
    @IsNotEmpty()
    customer_id: string;

    @IsUUID()
    @IsNotEmpty()
    restaurant_id: string;

    @IsString()
    @IsNotEmpty()
    delivery_address: string;

    @IsOptional()
    @IsString()
    special_instructions: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDTO)
    items: OrderItemDTO[];
}

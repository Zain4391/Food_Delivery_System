import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from "class-validator";
import { CATEGORY } from "../entities/menu-item.entity";

export class CreateMenuItemDTO {

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsNotEmpty()
    price: number;

    @IsEnum(CATEGORY)
    @IsNotEmpty()
    category: CATEGORY;

    @IsInt()
    @Min(1)
    @IsOptional()
    preparation_time?: number;
}
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from "class-validator";
import { CATEGORY } from "../entities/menu-item.entity";

export class UpdateMenuItemDTO {

    @IsString()
    @IsOptional()
    @MaxLength(50)
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsEnum(CATEGORY)
    @IsOptional()
    category?: CATEGORY;

    @IsInt()
    @Min(1)
    @IsOptional()
    preparation_time?: number;
}

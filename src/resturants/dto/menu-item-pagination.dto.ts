import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { CATEGORY } from "../entities/menu-item.entity";

export class MenuItemPaginationDTO {

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
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(CATEGORY)
    category?: CATEGORY;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    maxPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    minPrepTime?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    maxPrepTime?: number;

    @IsOptional()
    @IsString()
    @IsIn(['name', 'price', 'category', 'created_at'])
    sortBy?: string;

    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

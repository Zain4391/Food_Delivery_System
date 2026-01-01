import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";
import { CATEGORY } from "../entities/menu-item.entity";

export class MenuItemPaginationDTO {

    @IsInt()
    @Min(1)
    page: number = 1;

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
    @IsNumber()
    @IsPositive()
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    maxPrice?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    minPrepTime?: number;

    @IsOptional()
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

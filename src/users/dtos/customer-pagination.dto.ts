import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class CustomerPaginationDTO {

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
    @IsString()
    @IsIn(['name', 'email', 'created_at'])
    sortBy?: string;

    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

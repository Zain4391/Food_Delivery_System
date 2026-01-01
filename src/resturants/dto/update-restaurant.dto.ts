import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateRestaurantDTO {

    @IsOptional()
    @IsString()
    @MaxLength(150)
    name: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    cusine_type: string;

    @IsOptional()
    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone: string;

    @IsOptional()
    @IsEmail()
    email: string;
}

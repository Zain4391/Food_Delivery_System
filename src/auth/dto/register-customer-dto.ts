import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RegisterCustomerDTO {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsOptional()
    profile_image_url?: string;
}
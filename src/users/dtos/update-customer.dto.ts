import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateCustomerDTO {

    @IsString()
    @IsOptional()
    name: string;
    
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    address: string;
}
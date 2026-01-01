import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { ROLES } from "src/common/enums/roles.enum";

export class RegisterCustomerDTO {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8, { message: "Password must be of minimum length 8" })
    password: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsEnum(ROLES)
    @IsOptional()
    role?: ROLES;

    @IsString()
    @IsOptional()
    profile_image_url?: string;
}
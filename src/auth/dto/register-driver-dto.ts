import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { VEHICLE_TYPE } from "src/drivers/entities/driver.entity";


export class RegisterDriverDTO {

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
    @MinLength(11, { message: "Phone number must be of 11 digits"})
    phone: string;

    @IsEnum(VEHICLE_TYPE, { message: "Invalid Vehivle type" })
    vehicle_type: VEHICLE_TYPE;

    @IsString()
    @IsOptional()
    profile_image_url: string;
    
}
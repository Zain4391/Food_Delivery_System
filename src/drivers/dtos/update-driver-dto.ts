import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { VEHICLE_TYPE } from "../entities/driver.entity";

export class UpdateDriverDTO {

    @IsString()
    @IsOptional()
    name: string;
    
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    phone: string;

    @IsEnum(VEHICLE_TYPE)
    @IsOptional()
    vehicle_type: VEHICLE_TYPE;
}
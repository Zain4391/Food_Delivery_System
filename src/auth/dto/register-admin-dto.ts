import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterAdminDTO {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8, { message: "Password must be of minimum length 8" })
    password: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsOptional()
    profile_image_url?: string;
}
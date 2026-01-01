import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ForgotPasswordDTO {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    confirmNewPassword: string;
}
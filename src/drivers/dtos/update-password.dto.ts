import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class UpdatePasswordDTO {

    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: "New password must be at least 8 characters long" })
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    confirmNewPassword: string;
}
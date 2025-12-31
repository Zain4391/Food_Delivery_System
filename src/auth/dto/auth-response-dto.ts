import { Expose } from "class-transformer";
import { UserResponseDTO } from "./user-response-dto";

export class AuthResponseDTO {

    @Expose()
    access_token: string;

    @Expose()
    user: UserResponseDTO;

    constructor(partial: Partial<AuthResponseDTO>) {
        Object.assign(this, partial)
    }
}
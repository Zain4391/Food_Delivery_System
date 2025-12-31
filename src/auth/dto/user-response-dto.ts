import { Expose } from "class-transformer";

export class UserResponseDTO {

    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    email: string;

    constructor(partial: Partial<UserResponseDTO>) {
        Object.assign(this, partial);
    }
}
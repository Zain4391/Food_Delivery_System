import { Exclude, Expose } from "class-transformer";
import { UserResponseDTO } from "./user-response-dto";

export class AdminResponseDTO extends UserResponseDTO {

    @Expose()
    address: string;

    @Expose()
    profile_image_url?: string;

    @Exclude()
    password: string;

    constructor(partial: Partial<AdminResponseDTO>) {
        super(partial);
        Object.assign(this, partial);
    }

}
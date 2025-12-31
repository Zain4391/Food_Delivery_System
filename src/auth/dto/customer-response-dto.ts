import { Exclude, Expose } from "class-transformer";
import { UserResponseDTO } from "./user-response-dto";


export class CustomerResponseDTO extends UserResponseDTO {

    @Expose()
    address: string;

    @Expose()
    profile_img_url?: string;

    @Exclude()
    password: string;

    constructor(parttial: Partial<CustomerResponseDTO>) {
        super(parttial)
        Object.assign(this, parttial);
    }
}
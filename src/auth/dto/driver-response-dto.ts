import { Exclude, Expose } from "class-transformer";
import { UserResponseDTO } from "./user-response-dto";
import { VEHICLE_TYPE } from "src/drivers/entities/driver.entity";

export class DriverResponseDTO extends UserResponseDTO {

    @Expose()
    phone: string;

    @Expose()
    vehicle_type: VEHICLE_TYPE;

    @Expose()
    is_available: boolean;

    @Expose()
    profile_img_url?: string;

    @Expose()
    role?: string;

    @Expose()
    created_at?: Date;

    @Expose()
    updated_at?: Date;

    @Exclude()
    password: string;

    constructor(partial: Partial<DriverResponseDTO> & { profile_image_url?: string }) {
        super(partial);
        Object.assign(this, partial);
        // Entity stores 'profile_image_url'; DTO exposes it as 'profile_img_url'
        if (partial.profile_image_url !== undefined) {
            this.profile_img_url = partial.profile_image_url;
        }
    }
}

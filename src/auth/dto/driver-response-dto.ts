import { Exclude, Expose } from "class-transformer";
import { UserResponseDTO } from "./user-response-dto";
import { VEHICLE_TYPE } from "src/drivers/entities/driver.entity";


export class DriverResponseDTO extends UserResponseDTO{

    @Expose()
    phone: string;

    @Expose()
    vehicle_type: VEHICLE_TYPE;

    @Expose()
    is_available: boolean;

    @Expose()
    profile_img_url?: string;

    @Exclude()
    password: string;

    constructor(partial: Partial<DriverResponseDTO>) {
        super(partial);
        Object.assign(this, partial);
    }
}
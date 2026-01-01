import { Expose } from "class-transformer";

export class DeliveryResponseDTO {
    @Expose()
    id: string;

    @Expose()
    order_id: string;

    @Expose()
    picked_up_at: Date;

    @Expose()
    delivered_at: Date;

    @Expose()
    created_at: Date;

    @Expose()
    updated_at: Date;

    constructor(partial: Partial<DeliveryResponseDTO>) {
        Object.assign(this, partial);
    }
}

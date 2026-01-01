import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateDeliveryDTO {

    @IsUUID()
    @IsNotEmpty()
    order_id: string;
}
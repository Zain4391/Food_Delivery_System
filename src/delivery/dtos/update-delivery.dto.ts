import { IsDateString, IsOptional } from "class-validator";

export class UpdateDeliveryDTO {

    @IsOptional()
    @IsDateString()
    picked_up_at: Date;

    @IsOptional()
    @IsDateString()
    delivered_at: Date;
}

import { IsDateString, IsString, IsUUID } from "class-validator";

export abstract class BaseEventDTO {

    @IsUUID()
    eventId: string;

    @IsDateString()
    timestamp: string;

    @IsString()
    eventType: string;

    constructor() {
        this.eventId = crypto.randomUUID();
        this.timestamp = new Date().toISOString();
    }
}
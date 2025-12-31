import { HttpStatus } from "@nestjs/common";

export interface errorType {
    message: string;
    statusCode: HttpStatus;
    timestamp: string;
}
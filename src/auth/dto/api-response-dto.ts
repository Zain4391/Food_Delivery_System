import { Expose } from "class-transformer";
import type { errorType } from "../types/error.type";
import { HttpStatus } from "@nestjs/common";

export class ApiSuccessResponse<T> {

    @Expose()
    statusCode: HttpStatus;

    @Expose()
    success: boolean;

    @Expose()
    data: T

    @Expose()
    message?: string;

    constructor(data: T, message: string, statusCode: HttpStatus) {
        this.success = true;
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
    }
};

export class ApiErrorResponse {

    @Expose()
    success: boolean;

    @Expose()
    error: errorType;

    constructor(message: string, statusCode: HttpStatus) {
        this.success = false;
        this.error = {
            message: message,
            statusCode: statusCode,
            timestamp: new Date().toISOString()
        };
    }

};
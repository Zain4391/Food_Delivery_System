import { Expose } from "class-transformer";
import type { errorType } from "../types/error.type";
import { HttpStatus } from "@nestjs/common";

export class ApiSuccessResponse<T> {

    @Expose()
    success: boolean;

    @Expose()
    data: T

    @Expose()
    message?: string;

    constructor(data: T, message: string) {
        this.success = true;
        this.message = message;
        this.data = data;
    }
};

export class ApiErrorResponse {

    @Expose()
    success: boolean;

    @Expose()
    error: errorType;

    constructor(message: string, statusCode: HttpStatus) {
        this.success = false;
        this.error.message = message;
        this.error.statusCode = statusCode;
        this.error.timestamp = new Date().toISOString();
    }

};
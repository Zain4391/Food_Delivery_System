import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorResponse } from 'src/auth/dto/api-response-dto';

export class CustomBaseException extends HttpException {
  constructor(message: string, statusCode: HttpStatus) {
    const errorResponse = new ApiErrorResponse(message, statusCode);
    super(errorResponse, statusCode);
  }
}
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomBaseException extends HttpException {
  constructor(message: string, statusCode: HttpStatus) {
    super(
      {
        success: false,
        error: {
          message,
          statusCode,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode,
    );
  }
}
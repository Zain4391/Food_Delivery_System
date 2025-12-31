import { Catch, ExceptionFilter, ArgumentsHost, HttpException, Logger } from "@nestjs/common";
import { Response, Request } from "express";


@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {

  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[] = "Internal Server Error";
    let errorResponse: Record<string, unknown> | undefined;

    // custom exception handling
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      errorResponse = exceptionResponse as Record<string, unknown>;
      const respMessage = (errorResponse as { message?: string | string[] }).message;
      message = respMessage || message;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if(exception instanceof Error) {
        message = exception.message;
        this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    const messageStr = Array.isArray(message) ? message.join(', ') : message;

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${messageStr}`,
    );

    response.status(status).json(
      errorResponse || {
        success: false,
        error: {
          statusCode: status,
          message,
          timestamp: new Date().toISOString(),
          path: request.url
        }
      }
    );
  }
}
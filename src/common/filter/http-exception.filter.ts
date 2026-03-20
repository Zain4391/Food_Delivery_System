import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response, Request } from "express";
import { ApiErrorResponse } from "src/auth/dto/api-response-dto";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {

  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal Server Error";
    let errorResponse: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      // Known HTTP exceptions (guards, pipes, manual throws)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        errorResponse = exceptionResponse as Record<string, unknown>;
        const respMessage = (errorResponse as { message?: string | string[] }).message;
        if (respMessage) {
          message = Array.isArray(respMessage) ? respMessage.join(", ") : respMessage;
        }
      }
    } else if (exception instanceof Error) {
      // Unhandled runtime errors (TypeErrors, etc.)
      message = exception.message;
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`Unknown exception type`, String(exception));
    }

    const messageStr = Array.isArray(message) ? message.join(", ") : message;

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${messageStr}`,
    );

    const errorResponseObj = new ApiErrorResponse(messageStr, status);
    response.status(status).json(errorResponse ?? errorResponseObj);
  }
}

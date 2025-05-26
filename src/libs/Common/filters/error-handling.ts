/* eslint-disable prettier/prettier */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message = exception.name;
    response.status(status).json({
      statusCode: status,
      message,
      error: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/* eslint-disable prettier/prettier */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    
    let message = exception.message;
    let validationErrors: any = null;

    // Handle validation errors specifically
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response['message']) {
        if (Array.isArray(response['message'])) {
          validationErrors = response['message'];
          message = 'Validation failed';
        } else {
          message = response['message'];
        }
      }
    }

    const errorResponse: any = {
      statusCode: status,
      message,
      error: exception.name,
      timestamp: new Date().toISOString(),
    };

    if (validationErrors) {
      errorResponse.validationErrors = validationErrors;
    }

    response.status(status).json(errorResponse);
  }
}

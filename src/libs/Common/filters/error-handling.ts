import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  Catch,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
interface IError {
  message: string;
  detail: string;
  error_code: string;
}
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  constructor(private readonly eventEmitter: EventEmitter2) {}
  catch(exception: Error, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    // const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();
    const statusCode: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';
    const properMessage = this.errMessageMapping(exception);
    message = properMessage ? properMessage : message;
    const res: any =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    this.logger.error(
      `error message => ${message}, trace => ${exception.stack}`,
    );
    let trackingNumber = '';
    if (statusCode >= 500) {
      trackingNumber = uuidv4();
      this.logMessage(ctx, exception, trackingNumber);
    }

    response &&
      response?.status &&
      response.status(statusCode).json({
        code: false,
        message: message ?? 'Oops! Something went wrong. Please try again',
        error: message,
        error_trace: exception?.stack,
        response: res,
        trackingNumber,
      });
  }
  private logMessage(
    ctx: HttpArgumentsHost,
    exception: any,
    trackingNumber: string,
  ) {
    const request: Request = ctx.getRequest();
    const response = ctx.getResponse();
    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof BadRequestException
        ? (exception.getResponse() as IError)
        : {
            message: exception?.message,
            detail: exception?.detail,
            error_code: exception?.code,
          };
    let userAgent = 'Microservice Agent';
    if (exception instanceof HttpException) {
      userAgent = request?.get('sec-ch-ua') || request?.get('user-agent') || '';
    }
    const createErrorLogger = {
      status,
      action: request?.method,
      url: `${request?.hostname}${request?.url}` || '',
      payload: response?.req?.body || '',
      ip: request?.ip,
      userAgent,
      params: request?.params || '',
      query: request?.query || '',
      user: response?.req?.user || '',
      userId: response?.req?.user?.id || '',
      errorMessage: exception?.stack || message?.detail || '',
      message: message?.message || '',
      trackingNumber,
    };
    this.eventEmitter.emit('create.error-logger', createErrorLogger);
    this.logger.error(
      `End Request for ${request.path}`,
      `method=${request?.method} status=${status} error_code=${
        message?.error_code ? message?.error_code : null
      } message=${message?.message ? message?.message : null} detail=${
        message?.detail ? message?.detail : null
      }`,
      status >= 500 ? exception?.stack : '',
    );
  }
  private errMessageMapping(exception: any) {
    const code = exception?.code;
    const detailTemp = exception?.detail?.split(' ')[1] || '';
    const detail = detailTemp.split('=');
    const column = exception?.column ? exception?.column : detail[0];
    const handleError = {
      '0Z002': () => {
        return `you don't have permission to modify ${column} column`;
      },
      '23505': () => {
        return `${column}  already exists`;
      },
      '23503': () => {
        return `${column} doesn't exist from the referenced table`;
      },
      '23502': () => {
        return `column ${column} can not be null`;
      },
      '23514': () => {
        return `column ${column} can not be null`;
      },
      '22P02': () => {
        return `column ${column} text representation is incorrect`;
      },
      '23506': () => {
        return `column ${column} must be unique`;
      },
      '42601': () => {
        return `provided query is not correct`;
      },
      '42703': () => {
        return `column ${column} is not defined`;
      },
      '42P01': () => {
        return `table ${column} is not defined`;
      },
      '40P01': () => {
        return `database dead lock detected try again `;
      },
      '57014': () => {
        return `your query is canceled try again`;
      },
      '42501': () => {
        return `your do  not have sufficient privilege for this operation`;
      },
    };

    if (handleError[code]) {
      return handleError[code]();
    } else {
      return null;
    }
  }
}

/* eslint-disable prettier/prettier */
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Request } from 'express';
  import * as jwt from 'jsonwebtoken';

  export const CONNECTION_KEY = 'CONNECTION_KEY';
  export const PUBLIC_CONNECTION_KEY = 'PUBLIC_CONNECTION_KEY';
  export const TENANT_ID = 'TENANT_ID';
  export const SCHEMA_NAME = 'SCHEMA_NAME';

  @Injectable()
  export class SchemaAddInterceptor implements NestInterceptor {
    constructor() {}
    async intercept(
      context: ExecutionContext,
      next: CallHandler<any>,
    ): Promise<any> {
      const result = await next.handle();
      const req = context.switchToHttp().getRequest<Request>();
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          const decodedToken: any = jwt.decode(token);
          if (decodedToken.tenantId) {
            req[TENANT_ID] = decodedToken?.tenantId;
          }
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
      return result;
    }
  }
  
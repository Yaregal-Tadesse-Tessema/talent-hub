/* eslint-disable prettier/prettier */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { TenantDatabaseService } from 'src/modules/authentication/tenant-database.service';
import { DataSource } from 'typeorm';
export const CONNECTION_KEY = 'CONNECTION_KEY';
export const PUBLIC_CONNECTION_KEY = 'PUBLIC_CONNECTION_KEY';
export const TENANT_ID = 'TENANT_ID';
export const ORGANIZATION_NAME = 'ORGANIZATION_NAME';
@Injectable()
export class SchemaAddInterceptor implements NestInterceptor {
  constructor(private readonly tenantDatabaseService: TenantDatabaseService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<any> {
    const result = await next.handle();
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers.authorization?.split(' ')[1];
    let schema: string = '';
    if (token) {
      try {
        const decodedToken: any = jwt.decode(token);
        schema = decodedToken?.organizationSchemaName;
        req[TENANT_ID] = Number(decodedToken.organizationId);
        req[ORGANIZATION_NAME] = schema;
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    if (schema) {
      const connection: DataSource =
        await this.tenantDatabaseService.getConnection(schema);
      const publicConnection: DataSource =
        await this.tenantDatabaseService.getPublicConnection();
      req[CONNECTION_KEY] = connection;
      req[PUBLIC_CONNECTION_KEY] = publicConnection;
    }

    return result;
  }
}

/* eslint-disable prettier/prettier */
import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
  } from '@nestjs/common';
  import * as dotenv from 'dotenv';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
import { SessionEntity } from 'src/modules/auth/persistances/session.entity';
import { JobRequirementEntity } from 'src/modules/job-posting/job-requirement/persistance/job-requirement.entity';
import { JobPostingEntity } from 'src/modules/job-posting/job/persistencies/job-posting.entity';
import { PreScreeningQuestionEntity } from 'src/modules/job-posting/job/persistencies/pre-screening-question.entity';
import { SaveJobEntity } from 'src/modules/job-posting/job/persistencies/save-job-post.entity';
  import { DataSource } from 'typeorm';
import { TenantEntity } from '../persistencies/tenant.entity';
import { LookupEntity } from '../persistencies/lookup.entity';
import { EmployeeTenantEntity } from '../persistencies/employee-tenant.entity';
  dotenv.config({ path: '.env' });
  @Injectable()
  export class TenantDatabaseService implements OnModuleInit, OnModuleDestroy {
    private connections: Map<string, DataSource> = new Map();
    async getPrivateConnection(tenantSchema: string): Promise<DataSource> {
      if (this.connections.has(tenantSchema)) {
        return this.connections.get(tenantSchema);
      }
      const connection = new DataSource({
        type: 'postgres',
        host: process.env.PUBLIC_DATABASE_HOST,
        port: +process.env.PUBLIC_DATABASE_PORT,
        username: process.env.PUBLIC_DATABASE_USERNAME,
        password: process.env.PUBLIC_DATABASE_PASSWORD,
        database: process.env.PUBLIC_DATABASE_Name,
        schema: tenantSchema,
        entities: [
          JobPostingEntity,
          JobRequirementEntity,
          ApplicationEntity,
          SaveJobEntity,
          PreScreeningQuestionEntity,
        ],
        synchronize:
          process.env.PUBLIC_DATABASE_SYNCHRONIZATION == 'true' ? true : false,
      });
      await connection.initialize();
      this.connections.set(tenantSchema, connection);
      return connection;
    }
    async getPublicConnection(): Promise<DataSource> {
      const connection = new DataSource({
        type: 'postgres',
        host: process.env.PUBLIC_DATABASE_HOST,
        port: +process.env.PUBLIC_DATABASE_PORT,
        username: process.env.PUBLIC_DATABASE_USERNAME,
        password: process.env.PUBLIC_DATABASE_PASSWORD,
        database: process.env.PUBLIC_DATABASE_Name,
        schema: 'public',
        entities: [
          SessionEntity,
          TenantEntity,
          LookupEntity,
          EmployeeTenantEntity,
        ],
        synchronize:
          process.env.PUBLIC_DATABASE_SYNCHRONIZATION == 'true' ? true : false,
      });
      await connection.initialize();
      this.connections.set('public', connection);
      return connection;
    }
    async onModuleDestroy() {
      for (const connection of this.connections.values()) {
        await connection.destroy();
      }
    }
    async onModuleInit() {
      await this.getPublicConnection();
    }
  }
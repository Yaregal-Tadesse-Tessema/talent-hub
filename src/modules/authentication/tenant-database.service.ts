/* eslint-disable prettier/prettier */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { JobPostingEntity } from '../job-posting/job/persistencies/job-posting.entity';
import { JobRequirementEntity } from '../job-posting/job-requirement/persistance/job-requirement.entity';
import { SessionEntity } from '../auth/persistances/session.entity';
import { TenantEntity } from './persistances/tenant.entity';
import { EmployeeOrganizationEntity } from './persistances/employee-organization.entity';
import { ApplicationEntity } from '../application/persistences/application.entity';
import { LookupEntity } from './persistances/lookup.entity';
dotenv.config({ path: '.env' });
@Injectable()
export class TenantDatabaseService implements OnModuleInit, OnModuleDestroy {
  private connections: Map<string, DataSource> = new Map();
  async getConnection(tenantSchema: string): Promise<DataSource> {
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
      entities: [JobPostingEntity, JobRequirementEntity, ApplicationEntity],
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
        EmployeeOrganizationEntity,
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

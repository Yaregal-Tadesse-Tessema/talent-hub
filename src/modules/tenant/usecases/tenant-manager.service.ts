/* eslint-disable prettier/prettier */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantDatabaseService } from './tenant-database.service';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
@Injectable()
export class TenantManagerService implements OnApplicationBootstrap {
  private tenantConnections: Map<string, DataSource> = new Map();
  constructor(private databaseService: TenantDatabaseService) {}
  async onApplicationBootstrap() {
    const tenatesSchema = process.env.TENANTS_SCHEMA_NAMES;
    const tenants = JSON.parse(tenatesSchema.replace(/'/g, '"'));
    console.log(tenatesSchema);
    for (const tenant of tenants) {
      const schema_name = tenant;
      const connection = await this.databaseService.getPrivateConnection(schema_name);
      if(schema_name=='public'){
        this.tenantConnections.set(tenants, connection);
      }
    }
  }
  getTenantConnection(schema: string): DataSource {
    const connection = this.tenantConnections.get(schema);
    if (!connection) {
      throw new Error(`Tenant connection for schema "${schema}" not found.`);
    }
    return connection;
  }
}
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantEntity } from '../persistances/tenant.entity';
import { CreateTenantCommand, TenantResponse } from '../dtos/tenant.dto';
import { TenantDatabaseService } from '../tenant-database.service';
@Injectable()
export class TenantService {
  constructor(private tenantDatabaseService: TenantDatabaseService) {}

  async migrateTenantSchema(
    newSchemaName: string,
    oldSchemaName: string,
  ): Promise<void> {
    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.PUBLIC_DATABASE_HOST,
      port: +process.env.PUBLIC_DATABASE_PORT,
      username: process.env.PUBLIC_DATABASE_USERNAME,
      password: process.env.PUBLIC_DATABASE_PASSWORD,
      database: process.env.PUBLIC_DATABASE_Name,
      entities: [],
      synchronize: false,
    });
    await dataSource.initialize();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`CREATE SCHEMA  "${newSchemaName}";`);
      const tables = await queryRunner.query(`
              SELECT table_name
              FROM information_schema.tables
              WHERE table_schema = '${oldSchemaName}';
          `);

      for (const table of tables) {
        const tableName = table.table_name;

        // Step 3.1: Create the table in the new schema using `LIKE` to copy structure
        // if()
        await queryRunner.query(`
                  CREATE TABLE "${newSchemaName}"."${tableName}" 
                  (LIKE "${oldSchemaName}"."${tableName}" INCLUDING ALL);
              `);

        // Step 3.2: Copy data from the old schema to the new schema
        await queryRunner.query(`
            INSERT INTO "${newSchemaName}"."${tableName}"
            SELECT * FROM "${oldSchemaName}"."${tableName}";
        `);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      console.log('finally');
      // await queryRunner.release();
    }
  }
  async updateTenant(command: CreateTenantCommand): Promise<TenantResponse> {
    const publicConnection = this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = (await publicConnection).getRepository(
      TenantEntity,
    );
    const tenantEntity = CreateTenantCommand.fromCommand(command);
    tenantEntity.code = tenantEntity.schemaName;
    await tenantRepository.update(tenantEntity.id, tenantEntity);
    return TenantResponse.toResponse(tenantEntity);
  }
  async createTenant(command: CreateTenantCommand): Promise<TenantResponse> {
    const tenantEntity = CreateTenantCommand.fromCommand(command);
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(TenantEntity);
    const result = await tenantRepository.save(tenantEntity);
    const tenants = await tenantRepository.find();
    const tenantCount = tenants?.length > 0 ? tenants.length : 1;
    const schemaName = `_${tenantCount}`;
    tenantEntity.schemaName = schemaName;
    tenantEntity.code = schemaName;
    await tenantRepository.update(tenantEntity.id, tenantEntity);
    const defaultSchema = 'Demo';
    await this.migrateTenantSchema(schemaName, defaultSchema);
    return TenantResponse.toResponse(result);
  }
}

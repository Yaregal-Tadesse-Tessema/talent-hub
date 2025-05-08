/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './persistencies/tenant.entity';
import { LookupEntity } from './persistencies/lookup.entity';
import { EmployeeTenantEntity } from './persistencies/employee-tenant.entity';
import { AdminUserEntity } from './persistencies/admin.entity';
import { TenantService } from './usecases/tenant/tenant.usecase.command';
import { LookupService } from './usecases/lookup/lookup.usecase.command';
import { EmployeeTenantService } from './usecases/employee-tenant/employee-tenant.usecase.command';
import { TenantDatabaseService } from './usecases/tenant-database.service';
import { TenantManagerService } from './usecases/tenant-manager.service';
import { AdminUserService } from './usecases/admin/admin.usecase.command';
import { TenantController } from './controllers/tenant.controller';
import { LookupController } from './controllers/lookup.controller';
import { EmployeeTenantController } from './controllers/employee-tenant.controller';
import { AdminUserController } from './controllers/admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      LookupEntity,
      EmployeeTenantEntity,
      AdminUserEntity,
    ]),
  ],
  providers: [
    TenantService,
    LookupService,
    EmployeeTenantService,
    TenantDatabaseService,
    TenantManagerService,
    AdminUserService,
  ],
  controllers: [
    TenantController,
    LookupController,
    EmployeeTenantController,
    AdminUserController,
  ],
  exports: [TenantService, TenantDatabaseService],
})
export class TenantModule {}

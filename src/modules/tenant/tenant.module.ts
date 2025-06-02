/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './persistencies/tenant.entity';
import { LookupEntity } from './persistencies/lookup.entity';
import { EmployeeTenantEntity } from './persistencies/employee-tenant.entity';
import { AdminUserEntity } from './persistencies/admin.entity';
import { TenantService } from './usecases/tenant/tenant.usecase.command';
import { LookupService } from './usecases/lookup/lookup.usecase.command';
import { EmployeeTenantService } from './usecases/employee-tenant/employee-tenant.usecase.command';
import { AdminUserService } from './usecases/admin/admin.usecase.command';
import { TenantController } from './controllers/tenant.controller';
import { LookupController } from './controllers/lookup.controller';
import { EmployeeTenantController } from './controllers/employee-tenant.controller';
import { AdminUserController } from './controllers/admin.controller';
import { TenantRepository } from './persistencies/tenant.repository';
import { LookupRepository } from './persistencies/lookup.repository';
import { EmployeeTenantRepository } from './persistencies/employee-tenant.repository';
import { AdminUserRepository } from './persistencies/admin.repository';
import { UserTenantService } from './usecases/user-enant/user-tenant.usecase.command';
import { UserTenantRepository } from './persistencies/user-tenant.repository';
import { UserTenantController } from './controllers/user-tenant.controller';
import { UserTenantEntity } from './persistencies/user-tenant.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      LookupEntity,
      EmployeeTenantEntity,
      AdminUserEntity,
      UserTenantEntity,
    ]),
  ],
  providers: [
    TenantService,
    TenantRepository,
    LookupService,
    LookupRepository,
    EmployeeTenantService,
    EmployeeTenantRepository,

    AdminUserService,
    AdminUserRepository,

    UserTenantService,
    UserTenantRepository,
  ],
  controllers: [
    TenantController,
    LookupController,
    EmployeeTenantController,
    AdminUserController,
    UserTenantController,
  ],
  exports: [TenantService],
})
export class TenantModule {}

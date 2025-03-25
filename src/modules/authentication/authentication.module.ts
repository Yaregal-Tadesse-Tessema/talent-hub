/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './persistances/tenant.entity';
import { EmployeeOrganizationEntity } from './persistances/employee-organization.entity';
import { TenantService } from './services/tenant.service';
import { LookupService } from './services/look-up.service';
import { EmployeeOrganizationService } from './services/employee-organization.service';
import { TenantController } from './controller/tenant.controller';
import { LookupController } from './controller/lookup.controller';
import { EmployeeOrganizationController } from './controller/employee-organization.controller';
import { LookupEntity } from './persistances/lookup.entity';
import { TenantDatabaseService } from './tenant-database.service';
import { AdminUserEntity } from './persistances/admin-user.entity';
import { AdminUserService } from './services/admin-user.service';
import { AdminUserController } from './controller/admin-user.controller';
import { TenantManagerService } from './tenant-manager.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      LookupEntity,
      EmployeeOrganizationEntity,
      AdminUserEntity,
    ]),
  ],
  providers: [
    TenantService,
    LookupService,
    EmployeeOrganizationService,
    TenantDatabaseService,
    TenantManagerService,
    AdminUserService,
  ],
  controllers: [
    TenantController,
    LookupController,
    EmployeeOrganizationController,
    AdminUserController,
  ],
  exports: [TenantService, TenantDatabaseService],
})
export class AuthenticationModule {}

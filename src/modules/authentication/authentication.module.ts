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
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      LookupEntity,
      EmployeeOrganizationEntity,
    ]),
  ],
  providers: [TenantService, LookupService, EmployeeOrganizationService],
  controllers: [
    TenantController,
    LookupController,
    EmployeeOrganizationController,
  ],
  exports: [],
})
export class AuthenticationModule {}

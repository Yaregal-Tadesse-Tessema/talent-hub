import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantDatabaseService } from './usecase/tenant-database.service';
// import { DatabaseSourceService } from './usecase/database-source.service';
import { TenantManagerService } from './usecase/Tenant-manager.service';
import { TenantAwareRepository } from './persistance/tenant-aware-repository';
import { LookUpCommand } from './usecase/look-up/look-up.usecase.command';
import { LookUpRepository } from './persistance/look-up-table.repository';
import { TenantCommand } from './usecase/tenant/tenant.usecase.command';
import { TenantQuery } from './usecase/tenant/tenant.usecase.query';
import { LookUpQuery } from './usecase/look-up/look-up.usecase.query';
import { TenantController } from './controllers/tenant.controller';
import { TenantEntity } from './persistance/tenat.entity';
import { LookUpEntity } from './persistance/look-up-table.entity';
import { EmployeeModule } from '@employee/employee.module';
import { LookUpController } from './controllers/lookup.controller';
import {
  FileManagerModule,
  FileManagerService,
} from '@libs/common/file-manager';
import { EmployeeOrganizationRepository } from './persistance/employee-organizations.repository';
import { EmployeeOrganizationEntity } from './persistance/employee-organizations.entity';
import { EmployeeOrganizationController } from './controllers/employee-organization.controller';
import { EmployeeOrganizationQuery } from './usecase/employees-Organization/employee-organization.usecase.query';
import { TenantServiceProviderCommand } from './usecase/service-provider.service';
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      LookUpEntity,
      EmployeeOrganizationEntity,
    ]),
    FileManagerModule,
    EmployeeModule,
  ],
  controllers: [TenantController, LookUpController,EmployeeOrganizationController],
  providers: [
    TenantDatabaseService,
    // DatabaseSourceService,

    TenantManagerService,
    TenantAwareRepository,

    LookUpCommand,
    LookUpRepository,
    LookUpQuery,

    TenantCommand,
    TenantQuery,
    FileManagerService,

    EmployeeOrganizationRepository,
    EmployeeOrganizationQuery,

    TenantServiceProviderCommand
  ],
  exports: [
    TenantDatabaseService,
    // DatabaseSourceService,
    TenantDatabaseService,
    LookUpRepository,
    LookUpCommand,
    TenantManagerService,
    TenantServiceProviderCommand,
  ],
})
export class TenantDatabaseModule {}

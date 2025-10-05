import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from '../tenant/persistencies/tenant.entity';
import { LookupEntity } from '../tenant/persistencies/lookup.entity';
import { EmployeeTenantEntity } from '../tenant/persistencies/employee-tenant.entity';
import { JobPostingEntity } from '../job-posting/job/persistencies/job-posting.entity';
import { JobPostAdminService } from './usecase/jobpost.admin.service';
import { AdminJobPostingController } from './controller/jobpost.admin.controller';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      LookupEntity,
      EmployeeTenantEntity,
      JobPostingEntity,
    ]),
    ApplicationModule
  ],
  providers: [JobPostAdminService],
  controllers: [AdminJobPostingController],
})
export class AdministratorModule {}

/* eslint-disable prettier/prettier */
import { Repository} from 'typeorm';
import {Injectable,Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantEntity } from 'src/modules/tenant/persistencies/tenant.entity';
import { LookupEntity } from 'src/modules/tenant/persistencies/lookup.entity';
import { EmployeeTenantEntity } from 'src/modules/tenant/persistencies/employee-tenant.entity';
import { JobPostingEntity } from 'src/modules/job-posting/job/persistencies/job-posting.entity';
import { CreateTenantCommand } from 'src/modules/tenant/usecases/tenant/tenant.command';
import { CreateLookupCommand } from 'src/modules/tenant/usecases/lookup/lookup.command';
import { CreateEmployeeTenantCommand } from 'src/modules/tenant/usecases/employee-tenant/employee-tenant.command';
import { CreateAdminJobPostingCommand } from './command';
import { Util } from 'src/libs/Common/util';
import { EmployeeStatus } from 'src/modules/user/usecase/user.command';
import { JobPostingStatusEnums } from 'src/modules/job-posting/constants';
import { AccountStatusEnums } from 'src/modules/auth/constants';
@Injectable({ scope: Scope.REQUEST })
export class JobPostAdminService {
    constructor(
        @InjectRepository(TenantEntity)
        private readonly tenantRepo: Repository<TenantEntity>,
        @InjectRepository(LookupEntity)
        private readonly lookupRepo: Repository<LookupEntity>,
        @InjectRepository(EmployeeTenantEntity)
        private readonly employeeTenantRepo: Repository<EmployeeTenantEntity>,
        @InjectRepository(JobPostingEntity)
        private readonly jobPostRepo: Repository<JobPostingEntity>,
    ) { }
    async createJobPost(command: CreateAdminJobPostingCommand): Promise<any> {
        // tenant 
        let tenant = await this.tenantRepo.findOne({ where: { name: command?.tenantName } });
        if (!tenant) {
            const tenantEntity = new TenantEntity();
            tenantEntity.name = command?.tenantName;
            tenantEntity.tradeName = command?.tenantName;
            tenantEntity.code = Util.makeId('Tenant');
            tenantEntity.email = command?.email;
            tenantEntity.phoneNumber = command?.tenantPhone;
            tenant = await this.tenantRepo.save(tenantEntity);
        }
        let lookup = await this.lookupRepo.findOne({ where: [{ tenantId: tenant?.id }] });
        if (!lookup) {
            const lookupEntity = new LookupEntity();
            lookupEntity.email = command?.email;
            lookupEntity.phoneNumber = command?.tenantPhone;
            lookupEntity.password = Util.hashPassword('C0mplex!');
            lookupEntity.status = AccountStatusEnums.ACTIVE;
            lookupEntity.firstName = null;
            lookupEntity.lastName = null;
            lookupEntity.tenantId = tenant?.id;
            lookup = await this.lookupRepo.save(lookupEntity);
        }

        let employeeTenant = await this.employeeTenantRepo.findOne({ where: { tenant_Id: tenant?.id, lookupId: lookup?.id } });
        if (!employeeTenant) {
            const employeeTenantEntity = new EmployeeTenantEntity();
            employeeTenantEntity.lookupId = lookup?.id;
            employeeTenantEntity.tenantId = tenant?.id;
            employeeTenantEntity.tenantName = tenant?.name;
            employeeTenantEntity.startDate = new Date();
            employeeTenantEntity.jobTitle = 'Representative';
            employeeTenantEntity.status = EmployeeStatus.ACTIVE;
            employeeTenantEntity.tenant_Id = tenant?.id;
            employeeTenantEntity.createdAt = new Date();
            employeeTenantEntity.updatedAt = new Date();
            employeeTenant = await this.employeeTenantRepo.save(employeeTenantEntity);
        }
        let jobPost = await this.jobPostRepo.findOne({ where: { title: command?.jobTitle, tenantId: tenant?.id } });
        if (!jobPost) {
            const jobPostingEntity = new JobPostingEntity();
            jobPostingEntity.tenantId = tenant?.id;
            jobPostingEntity.title = command?.jobTitle;
            jobPostingEntity.employmentType = command?.jobType;
            jobPostingEntity.workMode = command?.worktype;
            jobPostingEntity.howToApply = command?.howToApply;
            jobPostingEntity.skill = command?.skills;
            jobPostingEntity.jobPostRequirement = command?.jobRequirement;
            jobPostingEntity.responsibilities = command?.responsibilities;
            jobPostingEntity.description = command?.description;
            jobPostingEntity.position = command?.position;
            jobPostingEntity.industry = command?.industry;
            jobPostingEntity.location = command?.tenantAddress;
            jobPostingEntity.deadline = command?.deadline;
            jobPostingEntity.gender = command?.gender;
            jobPostingEntity.positionNumbers = command?.numberOfPosition;
            jobPostingEntity.status = JobPostingStatusEnums.POSTED;
            jobPost = await this.jobPostRepo.save(jobPostingEntity);
        }
        ;
        return {
            tenant,
            lookup,
            employeeTenant,
            jobPost
        };
    }
    async createTenant(command: CreateTenantCommand): Promise<any> {
        const entity = CreateTenantCommand.fromCommand(command);
        const res = await this.tenantRepo.save(command);
        return res;
    }
    async getTenant(name: string): Promise<any> {
        const res = await this.tenantRepo.findOne({ where: { name: name } });
        return res;
    }

    async createLookup(command: CreateLookupCommand): Promise<any> {
        const entity = CreateLookupCommand.fromCommand(command);
        const res = await this.lookupRepo.save(command);
        return res;
    }
    async getLookupByEmail(email: string): Promise<any> {
        const res = await this.tenantRepo.findOne({ where: { email: email } });
        return res;
    }
    async getLookupByPhone(phoneNumber: string): Promise<any> {
        const res = await this.tenantRepo.findOne({ where: { phoneNumber: phoneNumber } });
        return res;
    }

    async createEmployeeTenant(command: CreateEmployeeTenantCommand): Promise<any> {
        const entity = CreateEmployeeTenantCommand.fromCommand(command);
        const res = await this.employeeTenantRepo.save(entity);
        return res;
    }
    async getEmployeeTenant(tenantId: string, lookupId: string): Promise<any> {
        const res = await this.employeeTenantRepo.findOne({ where: { tenant_Id: tenantId, lookupId: lookupId } });
        return res;
    }
}
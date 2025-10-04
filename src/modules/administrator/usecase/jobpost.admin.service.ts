/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { BadRequestException, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantEntity } from 'src/modules/tenant/persistencies/tenant.entity';
import { LookupEntity } from 'src/modules/tenant/persistencies/lookup.entity';
import { EmployeeTenantEntity } from 'src/modules/tenant/persistencies/employee-tenant.entity';
import { JobPostingEntity } from 'src/modules/job-posting/job/persistencies/job-posting.entity';
import { CreateTenantCommand } from 'src/modules/tenant/usecases/tenant/tenant.command';
import { CreateLookupCommand } from 'src/modules/tenant/usecases/lookup/lookup.command';
import { CreateEmployeeTenantCommand } from 'src/modules/tenant/usecases/employee-tenant/employee-tenant.command';
import { AdminJobApplicationCommand, CreateAdminJobPostingCommand } from './command';
import { Util } from 'src/libs/Common/util';
import { EmployeeStatus } from 'src/modules/user/usecase/user.command';
import { AppliedThroughEnums, JobPostingStatusEnums } from 'src/modules/job-posting/constants';
import { EmailService } from 'src/modules/notification/usecase/email.usecase.command';
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
        private readonly emailService: EmailService,
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
            tenantEntity.isAdminCreated = true;
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
            jobPostingEntity.appliedThrough = AppliedThroughEnums.PHYSICAL;
            jobPostingEntity.isAdminCreated = true
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

    async applyToJobByAdmin(
        command: AdminJobApplicationCommand,
        files: { originalname: string; buffer: Buffer; mimetype: string }[],
    ): Promise<any> {
        const jobPost = await this.jobPostRepo.findOne({
            where: { id: command.jobPostId },
            relations: ['tenant'],
        });
        if (!jobPost) {
            return { success: false, message: 'Job post not found' };
        }
        if (jobPost.appliedThrough !== AppliedThroughEnums.EMAIL) {
            throw new BadRequestException(`This job post is  applied through physical please go to the physical address to apply`);
        }
        const tenantEmail = jobPost?.tenant?.email??'yayasoles@gmail.com';
        if (!tenantEmail) {
            return { success: false, message: 'Tenant email not found' };
        }
        const attachments = (files || []).map((f) => ({
            filename: f.originalname,
            content: f.buffer,
            contentType: f.mimetype,
        }));
        await this.emailService.sendEmailWithAttachment(
            tenantEmail,
            `Application for ${jobPost.title}`,
            command.html || 'Please find the attached application documents.',
            attachments,
        );
        return { success: true };
    }

    async getAdminJobPosts(tenantName?: string): Promise<JobPostingEntity[]> {
        const posts = await this.jobPostRepo.find({ where: { isAdminCreated: true }, relations: ['tenant'] });
        if (tenantName) {
            return posts.filter((p) => p?.tenant?.name === tenantName);
        }
        return posts;
    }

    async getAdminJobPostById(id: string): Promise<JobPostingEntity> {
        const post = await this.jobPostRepo.findOne({ where: { id }, relations: ['tenant'] });
        return post;
    }
    async updateAdminJobPost(payload: Partial<CreateAdminJobPostingCommand>): Promise<JobPostingEntity> {
        const existing = await this.jobPostRepo.findOne({ where: { id: payload.id }, relations: ['tenant'] });
        if (!existing) {
            return null;
        }
        if (payload.jobTitle !== undefined) existing.title = payload.jobTitle;
        if (payload.jobType !== undefined) existing.employmentType = payload.jobType as any;
        if (payload.worktype !== undefined) existing.workMode = payload.worktype as any;
        if (payload.howToApply !== undefined) existing.howToApply = payload.howToApply as any;
        if (payload.skills !== undefined) existing.skill = payload.skills as any;
        if (payload.jobRequirement !== undefined) existing.jobPostRequirement = payload.jobRequirement as any;
        if (payload.responsibilities !== undefined) existing.responsibilities = payload.responsibilities as any;
        if (payload.description !== undefined) existing.description = payload.description as any;
        if (payload.position !== undefined) existing.position = payload.position as any;
        if (payload.industry !== undefined) existing.industry = payload.industry as any;
        if (payload.tenantAddress !== undefined) existing.location = payload.tenantAddress as any;
        if (payload.deadline !== undefined) existing.deadline = payload.deadline as any;
        if (payload.gender !== undefined) existing.gender = payload.gender as any;
        if (payload.numberOfPosition !== undefined) existing.positionNumbers = payload.numberOfPosition as any;
        if (payload.requiredYearOfExperience !== undefined) existing.requiredYearOfExperience = payload.requiredYearOfExperience as any;
        if (payload.appliedThrough !== undefined) existing.appliedThrough = payload.appliedThrough as any;
        const saved = await this.jobPostRepo.save(existing);
        return saved;
    }

    async deleteAdminJobPost(id: string): Promise<{ success: boolean }> {
        await this.jobPostRepo.delete(id);
        return { success: true };
    }
}
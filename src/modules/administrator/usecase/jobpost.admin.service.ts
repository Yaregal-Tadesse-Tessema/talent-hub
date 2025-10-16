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
import { AppliedThroughEnums, JobPostingStatusEnums, SalaryRangeEnum } from 'src/modules/job-posting/constants';
import { EmailService } from 'src/modules/notification/usecase/email.usecase.command';
import { AccountStatusEnums, OrganizationTypeEnums } from 'src/modules/auth/constants';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
import { ApplicationStatusEnums } from 'src/modules/application/constants';
import { ApplicationRepository } from 'src/modules/application/persistences/application.repository';
import { FileService } from 'src/modules/file/services/file.service';
import { UserInfo } from 'src/libs/Common/user-information';
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
        private readonly applicationRepo: ApplicationRepository,
        private readonly fileService: FileService,
    ) { }
    private normalizeToStringArray(value: string | string[] | null | undefined): string[] {
        if (!value) return [];
        if (Array.isArray(value)) {
            return value
                .filter((v) => typeof v === 'string' && v.trim().length > 0)
                .map((v) => v.trim());
        }
        const parts = String(value)
            .split(/[\n,;]+/)
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
        return parts.length > 0 ? parts : [];
    }
    private normalizeInteger(value: any): number | undefined {
        if (value === null || value === undefined) return undefined;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '') return undefined;
            const num = Number(trimmed);
            return Number.isFinite(num) ? Math.trunc(num) : undefined;
        }
        if (typeof value === 'number' && Number.isFinite(value)) {
            return Math.trunc(value);
        }
        return undefined;
    }
    private normalizeDecimal(value: any): number | undefined {
        if (value === null || value === undefined) return undefined;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '') return undefined;
            const num = Number(trimmed);
            return Number.isFinite(num) ? num : undefined;
        }
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        return undefined;
    }
    private normalizeDate(value: any): Date | undefined {
        if (!value) return undefined;
        if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value;
        const d = new Date(value);
        return isNaN(d.getTime()) ? undefined : d;
    }
    async createJobPosts(commands: CreateAdminJobPostingCommand[], currentUser: UserInfo): Promise<any> {
        const results = [];
        const errors = [];

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            try {
                // tenant 
                const tenantPhone = command?.tenantPhone==''?undefined:command?.phone;
                let tenant = await this.tenantRepo.findOne({ where: { name: command?.companyName } });
                const tenantEntity = new TenantEntity();
                tenantEntity.id = tenant ? tenant.id : undefined;
                tenantEntity.name = command?.companyName;
                tenantEntity.tradeName = command?.tenantName;
                tenantEntity.code = Util.makeId('Tenant');
                tenantEntity.email = command?.email;
                tenantEntity.phoneNumber = command?.tenantPhone?command?.tenantPhone:tenantPhone==''?undefined:tenantPhone;
                tenantEntity.isAdminCreated = true;
                tenantEntity.isProfilePublic = false;
                tenantEntity.hasAiActivated = false;
                tenantEntity.isVerified = false;
                tenantEntity.status = AccountStatusEnums.PENDING;
                tenantEntity.organizationType = OrganizationTypeEnums.PRIVATE;
                tenantEntity.creatorTenantId = currentUser?.tenantId;
                tenant = await this.tenantRepo.save(tenantEntity);
                let lookup = await this.lookupRepo.findOne({ where: [{ tenantId: tenant?.id }] });
                const lookupEntity = new LookupEntity();
                lookupEntity.id = lookup ? lookup.id : undefined;
                lookupEntity.email = command?.email;
                lookupEntity.phoneNumber = command?.tenantPhone;
                lookupEntity.password = Util.hashPassword('C0mplex!');
                lookupEntity.status = AccountStatusEnums.ACTIVE;
                lookupEntity.firstName = null;
                lookupEntity.lastName = null;
                lookupEntity.tenantId = tenant?.id;
                lookupEntity.isAdminCreated = true;
                lookupEntity.creatorTenantId = currentUser?.tenantId;
                lookup = await this.lookupRepo.save(lookupEntity);
                let employeeTenant = await this.employeeTenantRepo.findOne({ where: { tenant_Id: tenant?.id, lookupId: lookup?.id } });
                const employeeTenantEntity = new EmployeeTenantEntity();
                employeeTenantEntity.id = employeeTenant ? employeeTenant.id : undefined;
                employeeTenantEntity.lookupId = lookup?.id;
                employeeTenantEntity.tenantId = tenant?.id;
                employeeTenantEntity.tenantName = tenant?.name;
                employeeTenantEntity.startDate = new Date();
                employeeTenantEntity.jobTitle = 'Representative';
                employeeTenantEntity.status = EmployeeStatus.ACTIVE;
                employeeTenantEntity.tenant_Id = tenant?.id;
                employeeTenantEntity.createdAt = new Date();
                employeeTenantEntity.updatedAt = new Date();
                employeeTenantEntity.isAdminCreated = true;
                employeeTenantEntity.creatorTenantId = currentUser?.tenantId;
                employeeTenant = await this.employeeTenantRepo.save(employeeTenantEntity);
                let jobPost = await this.jobPostRepo.findOne({ where: { title: command?.title, tenantId: tenant?.id } });
                if (!jobPost) {
                    const jobPostingEntity = new JobPostingEntity();
                    jobPostingEntity.tenantId = tenant?.id;
                    jobPostingEntity.title = command?.title;
                    jobPostingEntity.description = command?.description?.trim();
                    jobPostingEntity.position = command?.position?.trim() ?? command?.title;
                    jobPostingEntity.industry = command?.industry;
                    jobPostingEntity.workMode = command?.worktype;
                    jobPostingEntity.city = command?.city;
                    jobPostingEntity.location = command?.tenantAddress?.trim() ?? command?.city;
                    jobPostingEntity.employmentType = command?.jobType;
                    jobPostingEntity.salaryRange = null;
                    jobPostingEntity.deadline = this.normalizeDate(command?.deadline);
                    jobPostingEntity.skill = this.normalizeToStringArray(command?.skills as any);
                    jobPostingEntity.benefits = this.normalizeToStringArray(command?.benefits as any);
                    jobPostingEntity.responsibilities = this.normalizeToStringArray(command?.responsibilities as any);
                    jobPostingEntity.status = JobPostingStatusEnums.DRAFT;
                    jobPostingEntity.gender = command?.gender;
                    jobPostingEntity.requiredYearOfExperience = this.normalizeInteger(command?.requiredYearOfExperience);
                    jobPostingEntity.minimumGPA = this.normalizeDecimal(command?.minimumGPA);
                    jobPostingEntity.companyName = command?.tenantName?.trim();
                    jobPostingEntity.postedDate = this.normalizeDate(command?.postedDate);
                    jobPostingEntity.applicationURL = command?.applicationURL;
                    jobPostingEntity.experienceLevel = command?.experienceLevel;
                    jobPostingEntity.fieldOfStudy = command?.fieldOfStudy;
                    jobPostingEntity.educationLevel = command?.educationLevel;
                    jobPostingEntity.howToApply = command?.howToApply?.trim();
                    jobPostingEntity.jobPostRequirement = this.normalizeToStringArray(command?.jobPostRequirement as any);
                    jobPostingEntity.positionNumbers = this.normalizeInteger(command?.positionNumbers) ?? 1;
                    jobPostingEntity.paymentType = command?.paymentType;
                    jobPostingEntity.appliedThrough = command.appliedThrough;
                    jobPostingEntity.isAdminCreated = true
                    jobPostingEntity.requiredattachements = this.normalizeToStringArray(command?.requiredattachements as any);
                    jobPostingEntity.creatorTenantId = currentUser?.tenantId;
                    jobPost = await this.jobPostRepo.save(jobPostingEntity);
                }

                results.push({
                    success: true,
                    index: i,
                    tenant,
                    lookup,
                    employeeTenant,
                    jobPost
                });
            } catch (error) {
                console.log(error);
                errors.push({
                    success: false,
                    index: i,
                    tenantName: command?.tenantName,
                    jobTitle: command?.title,
                    error: error.message
                });
            }
        }

        return {
            total: commands.length,
            successful: results.length,
            failed: errors.length,
            results,
            errors
        };
    }
    async createJobPostForOne(command: CreateAdminJobPostingCommand): Promise<any> {
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
            tenantEntity.isProfilePublic = false;
            tenantEntity.hasAiActivated = false;
            tenantEntity.isVerified = false;
            tenantEntity.status = AccountStatusEnums.PENDING;
            tenantEntity.organizationType = OrganizationTypeEnums.PRIVATE;
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
        let jobPost = await this.jobPostRepo.findOne({ where: { title: command?.title, tenantId: tenant?.id } });
        if (!jobPost) {
            const jobPostingEntity = new JobPostingEntity();
            jobPostingEntity.tenantId = tenant?.id;
            jobPostingEntity.title = command?.title;
            jobPostingEntity.employmentType = command?.jobType;
            jobPostingEntity.workMode = command?.worktype;
            jobPostingEntity.howToApply = command?.howToApply?.trim();
            jobPostingEntity.skill = command?.skills?.map((skill) => skill.trim());
            jobPostingEntity.jobPostRequirement = command?.jobPostRequirement;
            jobPostingEntity.responsibilities = command?.responsibilities;
            jobPostingEntity.description = command?.description?.trim();
            jobPostingEntity.position = command?.position?.trim();
            jobPostingEntity.industry = command?.industry;
            jobPostingEntity.location = command?.tenantAddress?.trim();
            jobPostingEntity.deadline = command?.deadline;
            jobPostingEntity.gender = command?.gender;
            jobPostingEntity.paymentType = command?.paymentType
            jobPostingEntity.status = JobPostingStatusEnums.DRAFT;
            jobPostingEntity.appliedThrough = AppliedThroughEnums.PHYSICAL;
            jobPostingEntity.isAdminCreated = true
            jobPostingEntity.postedDate = command?.postedDate;
            jobPostingEntity.companyName = command?.tenantName?.trim();
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
        files: Express.Multer.File[],
        currentUser: UserInfo,
    ): Promise<any> {
        if (files.length === 0) throw new BadRequestException('Please upload at least one file');

        // const filesInformation = files.map((f) => ({
        //     originalname: f.originalname,
        //     buffer: f.buffer,
        //     mimetype: f.mimetype,
        // }));

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
        const alreadyApplied = await this.applicationRepo.getOneByCriteria({
            JobPostId: jobPost.id,
            userId: currentUser.id,
        });
        if (alreadyApplied) throw new BadRequestException('You have already applied for this job');

        const tenantEmail =jobPost.applicationURL;
        if (!tenantEmail) {
            return { success: false, message: 'Tenant email not found' };
        }
        const attachments = (files || []).map((f) => ({
            filename: f.originalname,
            content: f.buffer,
            contentType: f.mimetype,
        }));
        // await this.emailService.sendEmailWithAttachment(
        //     tenantEmail,
        //     `Application for ${jobPost.title}`,
        //     command.html || 'Please find the attached application documents.',
        //     attachments,
        // );
        await this.emailService.sendGridEmailWithAttachments(
            'yayasoles@gmail.com',
            `Application for ${jobPost.title}`,
            command.html || 'Please find the attached application documents.',
            attachments,
        );
        if (files.length > 0) {
            const applicationEntity = new ApplicationEntity();
            applicationEntity.JobPostId = jobPost.id;
            applicationEntity.userId = currentUser.id;
            applicationEntity.status = ApplicationStatusEnums.PENDING;
            applicationEntity.createdAt = new Date();
            applicationEntity.updatedAt = new Date();
            const file = await this.fileService.mergeFilesAsMulterFile(files);
            const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
            const fileName = files[0].originalname;
            const fileId = `${currentUser.id}/ApplicationDocuments/${randomNumber}_${fileName}`;
            const res = await this.fileService.uploadAttachment(fileId, file);
            if (!res) throw new BadRequestException('file upload failed');
            applicationEntity.cv = res;
            await this.applicationRepo.create(applicationEntity);
            await this.jobPostRepo.update(jobPost.id, { applicationCount: jobPost.applicationCount + 1 });
        }
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
        if (payload.title !== undefined) existing.title = payload.title;
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
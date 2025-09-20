/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  EmploymentTypeEnums,
  JobPostingStatusEnums,
  PaymentTypeEnums,
  WorkTypeEnums,
} from '../../constants';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
export class CreateJobPostingCommand {
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  title: string;
  @ApiProperty()
  @IsOptional()
  description?: string;
  @ApiProperty()
  @IsNotEmpty()
  position: string;
  @ApiProperty()
  @IsNotEmpty()
  industry: string;
  @ApiProperty({ enum: WorkTypeEnums })
  @IsOptional()
  @IsEnum(WorkTypeEnums, { message: 'workMode must be a valid WorkTypeEnums value' })
  workMode?: WorkTypeEnums;
  @ApiProperty({ example: 'Addis Abeba' })
  @IsOptional()
  city?: string;
  @ApiProperty({ example: 'Bole Road, Addis Ababa, Ethiopia' })
  @IsOptional()
  location?: string;
  @ApiProperty({ enum: EmploymentTypeEnums })
  @IsOptional()
  @IsEnum(EmploymentTypeEnums, { message: 'employmentType must be a valid EmploymentTypeEnums value' })
  employmentType?: EmploymentTypeEnums;
  @ApiProperty()
  @IsOptional()
  salaryRange?: any;
  @ApiProperty()
  @IsOptional()
  tenantId?: string;
  @ApiProperty()
  @IsOptional()
  deadline?: Date;
  @ApiProperty()
  @IsOptional()
  skill?: string[];
  @ApiProperty()
  @IsOptional()
  benefits?: string[];
  @ApiProperty()
  @IsOptional()
  responsibilities?: string[];
  @ApiProperty({ enum: JobPostingStatusEnums })
  @IsOptional()
  @IsEnum(JobPostingStatusEnums, { message: 'status must be a valid JobPostingStatusEnums value' })
  status?: JobPostingStatusEnums;
  @ApiProperty()
  @IsOptional()
  gender?: string;
  @ApiProperty()
  @IsOptional()
  minimumGPA?: number;
  @ApiProperty()
  @IsOptional()
  companyName?: string;
  @ApiProperty()
  @IsOptional()
  companyLogo?: FileDto;
  @ApiProperty()
  @IsOptional()
  postedDate?: Date;
  @ApiProperty()
  @IsOptional()
  applicationURL?: string;
  @ApiProperty()
  @IsOptional()
  experienceLevel?: string;
  @ApiProperty()
  @IsOptional()
  fieldOfStudy?: string;
  @ApiProperty()
  @IsOptional()
  educationLevel?: string;
  @ApiProperty()
  @IsOptional()
  howToApply?: string;
  @ApiProperty()
  @IsOptional()
  onHoldDate?: Date;
  @ApiProperty()
  @IsOptional()
  jobPostRequirement?: string[];
  @ApiProperty()
  @IsOptional()
  positionNumbers?: number;
  @ApiProperty({ enum: PaymentTypeEnums })
  @IsOptional()
  @IsEnum(PaymentTypeEnums, { message: 'paymentType must be a valid PaymentTypeEnums value' })
  paymentType?: PaymentTypeEnums;
  @ApiProperty()
  @IsOptional()
  isFeatured?: boolean;
  @ApiProperty()
  @IsOptional()
  hasAiFilter?: boolean;
  @ApiProperty()
  @IsOptional()
  hasNormalFilter?: boolean;
  @ApiProperty()
  @IsOptional()
  requiredYearOfExperience?: number;
  
  @ApiProperty({ required: false })
  @IsOptional()
  organizationId?: string;
  
  @ApiProperty({ required: false })
  @IsOptional()
  requirementId?: string;
  
  currentUser?: any;

  static fromDto(dto: CreateJobPostingCommand): JobPostingEntity {
    const entity = new JobPostingEntity();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.title = dto.title;
    entity.description = dto.description;
    entity.position = dto?.position;
    entity.industry = dto?.industry;
    entity.workMode = dto?.workMode;
    entity.city = dto?.city;
    entity.location = dto?.location;
    entity.employmentType = dto?.employmentType;
    entity.salaryRange = dto?.salaryRange;
    entity.tenantId = dto.tenantId;
    entity.deadline = dto?.deadline;
    entity.skill = dto?.skill;
    entity.benefits = dto?.benefits;
    entity.responsibilities = dto?.responsibilities;
    entity.status = dto?.status;
    entity.gender = dto?.gender;
    entity.minimumGPA = dto?.minimumGPA;
    entity.companyName = dto?.companyName;
    entity.companyLogo = dto?.companyLogo;
    entity.postedDate = dto?.postedDate;
    entity.applicationURL = dto?.applicationURL;
    entity.experienceLevel = dto?.experienceLevel;
    entity.fieldOfStudy = dto?.fieldOfStudy;
    entity.educationLevel = dto?.educationLevel;
    entity.howToApply = dto?.howToApply;
    entity.onHoldDate = dto?.onHoldDate;
    entity.jobPostRequirement = dto?.jobPostRequirement;
    entity.positionNumbers = dto?.positionNumbers;
    entity.paymentType = dto?.paymentType;
    entity.isFeatured = dto?.isFeatured;
    entity.hasAiFilter = dto?.hasAiFilter;
    entity.hasNormalFilter = dto?.hasNormalFilter;
    entity.requiredYearOfExperience = dto?.requiredYearOfExperience;
    return entity;
  }
  static fromDtos(dto: CreateJobPostingCommand[]): JobPostingEntity[] {
    return dto?.map((d) => CreateJobPostingCommand.fromDto(d));
  }
}
export class UpdateJobPostingCommand extends CreateJobPostingCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
export class JobPostTelegramNotificationCommand {
  @ApiProperty()
  jobTitle: string;
  @ApiProperty()
  jobType: string;
  @ApiProperty()
  workLocation: string;
  @ApiProperty()
  Salary: string;
  @ApiProperty()
  deadline: Date;
  @ApiProperty()
  jobDescription: string;
  @ApiProperty()
  applicationLink: string;
}
export class ChangeJobPostStatusCommand {
  @ApiProperty({ enum: JobPostingStatusEnums })
  @IsEnum(JobPostingStatusEnums, {
    message: 'Status must be one of: Draft, Pending, Posted,Expired',
  })
  status: JobPostingStatusEnums;
  @ApiProperty()
  @IsNotEmpty({ message: 'id can not be empty' })
  id: string;
}
export class RePostJobCommand {
  @ApiProperty()
  @IsNotEmpty({ message: 'jobPost id can not be empty' })
  jobPostId: string;
  @ApiProperty()
  deadLine?: Date;
}
export class JobPostFeaturingCOmmand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  status: boolean;
}

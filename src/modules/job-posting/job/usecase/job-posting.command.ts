/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import {
  EmploymentTypeEnums,
  JobIndustryEnums,
  JobPostingStatusEnums,
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
  description: string;
  @ApiProperty()
  @IsNotEmpty()
  position: string;
  @ApiProperty({ default: JobIndustryEnums.INFORMATION_TECHNOLOGY })
  @IsNotEmpty()
  industry: JobIndustryEnums;

  @ApiProperty()
  type: WorkTypeEnums;
  @ApiProperty({ example: 'Addis Abeba' })
  city: string;
  @ApiProperty({ example: 'Bole Road, Addis Ababa, Ethiopia' })
  location: string;
  @ApiProperty()
  employmentType: EmploymentTypeEnums;
  @ApiProperty()
  salaryRange: any;
  // @ApiProperty()
  organizationId: string;
  @ApiProperty()
  deadline: Date;
  @ApiProperty()
  requirementId: string;
  @ApiProperty()
  skill: string[];
  @ApiProperty()
  benefits: string[];
  @ApiProperty()
  responsibilities: string[];
  @ApiProperty()
  status: JobPostingStatusEnums;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  minimumGPA: number;
  @ApiProperty()
  companyName: string;
  @ApiProperty()
  companyLogo: FileDto;
  @ApiProperty()
  postedDate: Date;
  @ApiProperty()
  applicationURL: string;
  @ApiProperty()
  experienceLevel: string;
  @ApiProperty()
  fieldOfStudy: string;
  @ApiProperty()
  educationLevel: string;
  @ApiProperty()
  howToApply: string;
  @ApiProperty()
  onHoldDate: Date;
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
    entity.type = dto?.type;
    entity.city = dto?.city;
    entity.location = dto?.location;
    entity.employmentType = dto?.employmentType;
    entity.salaryRange = dto?.salaryRange;
    entity.organizationId = dto?.organizationId;
    entity.deadline = dto?.deadline;
    entity.requirementId = dto?.requirementId;
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
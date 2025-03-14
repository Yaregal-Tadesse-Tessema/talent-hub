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
export class CreateJobPostingCommand {
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty({ default: JobIndustryEnums.INFORMATION_TECHNOLOGY })
  industry: JobIndustryEnums;
  @ApiProperty()
  position: string;
  @ApiProperty()
  workType: WorkTypeEnums;
  @ApiProperty({ example: 'Addis Abeba' })
  workCity: string;
  @ApiProperty({ example: 'Bole Road, Addis Ababa, Ethiopia' })
  workLocation: string;
  @ApiProperty()
  employmentType: EmploymentTypeEnums;
  @ApiProperty()
  salary: string;
  @ApiProperty()
  deadline: Date;
  @ApiProperty()
  gender: string;
  // @ApiProperty()
  organizationId: string;
  @ApiProperty()
  experienceLevel: string;
  @ApiProperty()
  fieldOfStudy: string;
  @ApiProperty()
  educationLevel: string;
  @ApiProperty()
  gpa: number;

  @ApiProperty()
  requirementId: string;
  @ApiProperty()
  skill: string[];
  @ApiProperty()
  status: JobPostingStatusEnums;
  @ApiProperty()
  applicationLink: string;
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
    entity.workLocation = dto?.workLocation;
    entity.workCity = dto?.workCity;
    entity.workType = dto?.workType;
    entity.employmentType = dto?.employmentType;
    entity.salary = dto?.salary;
    entity.organizationId = dto?.organizationId;
    entity.requirementId = dto?.requirementId;
    entity.skill = dto?.skill;
    entity.status = dto?.status;
    entity.deadline = dto?.deadline;
    entity.gender = dto?.gender;
    entity.applicationLink = dto?.applicationLink;
    return entity;
  }

  /**
   * Transfer list of DTO object to Entity  list
   *
   */
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
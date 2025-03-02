/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import {
  EmploymentTypeEnums,
  JobIndustryEnums,
  JobPostingStatusEnums,
  WorkLocationEnums,
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
  workLocation: WorkLocationEnums;
  @ApiProperty()
  employmentType: EmploymentTypeEnums;
  @ApiProperty()
  salary: number;
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
    entity.employmentType = dto?.employmentType;
    entity.salary = dto?.salary;
    entity.organizationId = dto?.organizationId;
    entity.requirementId = dto?.requirementId;
    entity.skill = dto?.skill;
    entity.status = dto?.status;
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

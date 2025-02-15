import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { EmploymentTypeEnums, JobPostingStatusEnums, WorkLocationEnums } from '../../constants';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
export class JobPostingResponse {
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  position: string;
  @ApiProperty()
  workLocation: WorkLocationEnums;
  @ApiProperty()
  employmentType: EmploymentTypeEnums;
  @ApiProperty()
  salary: number;
  @ApiProperty()
  organizationId: string;
  @ApiProperty()
  requirementId: string;
  @ApiProperty()
  skill: string[];
  @ApiProperty()
  status: JobPostingStatusEnums;
  
  static toResponse(
    entity: JobPostingEntity
  ): JobPostingResponse {
    const response = new JobPostingResponse();
    if (!entity) {
      return null;
    }
    response.id = entity?.id;
    response.title = entity.title;
    response.description = entity.description;
    response.position = entity?.position;
    response.workLocation = entity?.workLocation;
    response.employmentType = entity?.employmentType;
    response.salary = entity?.salary;
    response.organizationId = entity?.organizationId;
    response.requirementId = entity?.requirementId;
    response.skill = entity?.skill;
    response.status = entity?.status;
    return response;
  }
}


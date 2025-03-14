/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  EmploymentTypeEnums,
  JobPostingStatusEnums,
  WorkTypeEnums,
} from '../../constants';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
import { ApplicationResponse } from 'src/modules/application/usecase/application.response';
export class JobPostingResponse {
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  position: string;
  @ApiProperty()
  workLocation: string;
  @ApiProperty()
  workCity: string;
  @ApiProperty()
  workType: WorkTypeEnums;
  @ApiProperty()
  deadline: Date;
  @ApiProperty()
  employmentType: EmploymentTypeEnums;
  @ApiProperty()
  salary: string;
  @ApiProperty()
  organizationId: string;
  @ApiProperty()
  requirementId: string;
  @ApiProperty()
  applicationLink: string;
  @ApiProperty()
  skill: string[];
  @ApiProperty()
  status: JobPostingStatusEnums;
  @ApiProperty()
  gender: string;
  @ApiProperty({ type: () => [ApplicationResponse] })
  applications: ApplicationResponse[];
  static toResponse(entity: JobPostingEntity): JobPostingResponse {
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
    response.workCity = entity?.workCity;
    response.workType = entity?.workType;
    response.workType = entity?.workType;
    response.deadline = entity?.deadline;
    response.gender = entity?.gender;
    response.salary = entity?.salary;
    response.organizationId = entity?.organizationId;
    response.requirementId = entity?.requirementId;
    response.skill = entity?.skill;
    response.status = entity?.status;
    response.applicationLink = entity?.applicationLink;
    if (entity.applications && entity.applications.length > 0) {
      response.applications = entity.applications.map((item) =>
        ApplicationResponse.toResponse(item),
      );
    } else {
      response.applications = []; // Ensure it's always an array
    }
    return response;
  }
}

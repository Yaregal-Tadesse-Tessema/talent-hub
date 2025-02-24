/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { JobRequirementEntity } from '../persistance/job-requirement.entity';
export class JobRequirementResponse {
  id: string;
  @ApiProperty()
  experienceLevel: string;
  @ApiProperty()
  fieldOfStudy: string;
  @ApiProperty()
  educationLevel: string;
  @ApiProperty()
  gpa: number;

  static toResponse(dto: JobRequirementEntity): JobRequirementResponse {
    const entity = new JobRequirementResponse();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.experienceLevel = dto.experienceLevel;
    entity.fieldOfStudy = dto.fieldOfStudy;
    entity.educationLevel = dto?.educationLevel;
    entity.gpa = dto?.gpa;
    return entity;
  }
}

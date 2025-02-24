/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { JobRequirementEntity } from '../persistance/job-requirement.entity';
export class CreateJobRequirementCommand {
  id?: string;
  @ApiProperty()
  experienceLevel: string;
  @ApiProperty()
  fieldOfStudy: string;
  @ApiProperty()
  educationLevel: string;
  @ApiProperty()
  gpa: number;

  static fromDto(dto: CreateJobRequirementCommand): JobRequirementEntity {
    const entity = new JobRequirementEntity();
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

  /**
   * Transfer list of DTO object to Entity  list
   *
   */
  static fromDtos(dto: CreateJobRequirementCommand[]): JobRequirementEntity[] {
    return dto?.map((d) => CreateJobRequirementCommand.fromDto(d));
  }
}
export class UpdateJobRequirementCommand extends CreateJobRequirementCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

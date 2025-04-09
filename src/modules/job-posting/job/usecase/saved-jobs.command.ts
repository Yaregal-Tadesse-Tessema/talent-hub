/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { SaveJobEntity } from '../persistencies/save-job-post.entity';
export class CreateSavedJobsCommand {
  id?: string;
  @ApiProperty()
  jobPostId: string;
  @ApiProperty()
  userId: string;

  static fromDto(dto: CreateSavedJobsCommand): SaveJobEntity {
    const entity = new SaveJobEntity();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.jobPostId = dto.jobPostId;
    entity.userId = dto.userId;
    return entity;
  }

  /**
   * Transfer list of DTO object to Entity  list
   *
   */
  static fromDtos(dto: CreateSavedJobsCommand[]): SaveJobEntity[] {
    return dto?.map((d) => CreateSavedJobsCommand.fromDto(d));
  }
}
export class UpdateSaveJobCommand extends CreateSavedJobsCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class UnsaveJobPostCommand {
  @ApiProperty()
  jobPostId: string;
  @ApiProperty()
  userId: string;
}

/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { SaveJobEntity } from '../persistencies/save-job-post.entity';
export class SavedJobsResponse {
  id: string;
  @ApiProperty()
  jobPostId: string;
  @ApiProperty()
  userId: string;

  static toResponse(dto: SaveJobEntity): SavedJobsResponse {
    const entity = new SavedJobsResponse();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.jobPostId = dto.jobPostId;
    entity.userId = dto.userId;
    return entity;
  }
}

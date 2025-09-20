/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { SaveJobEntity } from '../persistencies/save-job-post.entity';
import { UserResponse } from 'src/modules/user/usecase/user.response';
import { JobPostingResponse } from './job-posting.response';
export class SavedJobsResponse {
  id: string;
  @ApiProperty()
  jobPostId: string;
  @ApiProperty()
  userId: string;

  @ApiProperty({ type: () => JobPostingResponse })
  jobPost: JobPostingResponse;
  @ApiProperty({ type: () => UserResponse })
  user: UserResponse;
  static toResponse(dto: SaveJobEntity): SavedJobsResponse {
    const entity = new SavedJobsResponse();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.jobPostId = dto.jobPostId;
    entity.userId = dto.userId;
    if (dto?.jobPosting) {
      entity.jobPost = JobPostingResponse.toResponse(dto.jobPosting);
    }
    if (dto?.user) {
      entity.user = UserResponse.toResponse(dto.user);
    }
    return entity;
  }
}

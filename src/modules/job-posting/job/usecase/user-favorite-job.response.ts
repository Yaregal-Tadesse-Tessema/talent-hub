/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateUserFavoriteJobCommand } from './user-favorite-job.command';
import { UserFavoriteJobEntity } from 'src/modules/job-posting/job/persistencies/user-favorite-job.entity';
import { UserResponse } from '../../../user/usecase/user.response';
import { JobPostingResponse } from 'src/modules/job-posting/job/usecase/job-posting.response';

export class UserFavoriteJobResponse extends CreateUserFavoriteJobCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  jobPost: JobPostingResponse;
  @ApiProperty()
  user: UserResponse;
  static toResponse(entity: UserFavoriteJobEntity): UserFavoriteJobResponse {
    const response = new UserFavoriteJobResponse();
    response.id = entity?.id;
    response.jobPostId = entity.jobPostId;
    response.userId = entity.userId;
    if (entity.user) {
      response.user = UserResponse.toResponse(entity.user);
    }
    if (entity.jobPost) {
      response.jobPost = JobPostingResponse.toResponse(entity.jobPost);
    }
    return response;
  }
}

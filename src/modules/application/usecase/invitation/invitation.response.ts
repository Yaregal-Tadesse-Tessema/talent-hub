/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from 'src/modules/user/usecase/user.response';
import { JobPostingResponse } from 'src/modules/job-posting/job/usecase/job-posting.response';
import { InvitationEntity } from '../../persistences/invitation.entity';
export class InvitationResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  jobPostId: string;
  @ApiProperty()
  invitationLink: string;
  @ApiProperty({ type: () => [JobPostingResponse] })
  jobPost: JobPostingResponse;
    @ApiProperty({ type: () => [UserResponse] })
  user: UserResponse;
  static toResponse(entity: InvitationEntity): InvitationResponse {
    const response = new InvitationResponse();
    if (!entity) {
      return null;
    }
    response.id = entity?.id;
    response.userId = entity.userId;
    response.jobPostId = entity.jobPostId;
    response.invitationLink = entity?.invitationLink;

    if (entity.JobPost) {
      response.jobPost = JobPostingResponse.toResponse(entity.JobPost);
    }
    if (entity?.user) {
      response.user = UserResponse.toResponse(entity.user);
    }
    return response;
  }
}

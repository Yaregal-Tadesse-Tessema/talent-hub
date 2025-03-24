/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { ApplicationEntity } from '../persistences/application.entity';
import { UserResponse } from 'src/modules/user/usecase/user.response';
import { JobPostingResponse } from 'src/modules/job-posting/job/usecase/job-posting.response';
export class ApplicationResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  JobPostId: string;
  @ApiProperty()
  cv: FileDto;
  @ApiProperty()
  coverLetter: string;
  @ApiProperty()
  applicationInformation: any;
  @ApiProperty({ type: () => [JobPostingResponse] })
  jobPost: JobPostingResponse;
  static toResponse(entity: ApplicationEntity): ApplicationResponse {
    const response = new ApplicationResponse();
    if (!entity) {
      return null;
    }
    response.id = entity?.id;
    response.userId = entity.userId;
    response.JobPostId = entity.JobPostId;
    response.cv = entity?.cv;
    response.coverLetter = entity?.coverLetter;
    response.applicationInformation = entity?.applicationInformation;

    if (entity.JobPost) {
      response.jobPost = JobPostingResponse.toResponse(entity.JobPost);
    }
    return response;
  }
}



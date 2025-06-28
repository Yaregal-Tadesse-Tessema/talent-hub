/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { ApplicationEntity } from '../persistences/application.entity';
import { UserResponse } from 'src/modules/user/usecase/user.response';
import { JobPostingResponse } from 'src/modules/job-posting/job/usecase/job-posting.response';
import {
  ApplicationJobMatchCommand,
  ReferralInformation,
} from './application.command';
import { ApplicationStatusEnums } from '../constants';
import { MessageResponse } from 'src/modules/notification/usecase/message/message.response';
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
  @ApiProperty()
  userInfo: any;
  @ApiProperty()
  remark: string;
  @ApiProperty()
  tags: string[];
  @ApiProperty()
  status: ApplicationStatusEnums;
  @ApiProperty()
  notification: string;
  @ApiProperty()
  questionaryScore: number;
  @ApiProperty()
  isViewed: boolean;
  @ApiProperty()
  referralInformation: ReferralInformation;
  @ApiProperty()
  referenceReason: string;
  @ApiProperty()
  isInvited: boolean;
  @ApiProperty()
  viewCount: number;
  @ApiProperty()
  tenantId: string;
  @ApiProperty()
  aiMatch: ApplicationJobMatchCommand;
  @ApiProperty()
  algorithmMatch: ApplicationJobMatchCommand;
  @ApiProperty({ type: () => [JobPostingResponse] })
  jobPost: JobPostingResponse;
  @ApiProperty({ type: () => [UserResponse] })
  user: UserResponse;
  @ApiProperty()
  applicationMessages: MessageResponse[];
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
    response.userInfo = entity?.userInfo;
    response.isViewed = entity?.isViewed;
    response.remark = entity?.remark;
    response.tags = entity?.tags;
    response.status = entity?.status;
    response.tenantId = entity?.tenantId;
    response.notification = entity?.notification;
    response.referralInformation = entity?.referralInformation;
    response.referenceReason = entity?.referenceReason;
    response.questionaryScore = entity?.questionaryScore;
    response.isInvited = entity?.isInvited;
    response.viewCount = entity?.viewCount;
    response.aiMatch = entity?.aiMatch;
    response.algorithmMatch = entity?.algorithmMatch;
    if (entity?.user) {
      response.user = UserResponse.toResponse(entity.user);
    }
    if (entity.JobPost) {
      response.jobPost = JobPostingResponse.toResponse(entity.JobPost);
    }
    if (entity?.applicationMessages?.length > 0) {
      response.applicationMessages = entity.applicationMessages.map((item) =>
        MessageResponse.toResponse(item),
      );
    }
    return response;
  }
}



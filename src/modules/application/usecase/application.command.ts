/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApplicationEntity } from '../persistences/application.entity';
import { ApplicationStatusEnums } from '../constants';
export class ReferralInformation {
  @ApiProperty()
  fullName: string;
  @ApiProperty()
  employeeId: string;
  @ApiProperty()
  id?: string;
}
export class CreateApplicationCommand {
  @IsOptional()
  id?: string;
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  userId: string;
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  JobPostId: string;
  @ApiProperty()
  coverLetter?: string;
  @ApiProperty()
  viewCount?: number;
  @ApiProperty()
  referralInformation?: ReferralInformation;
  @ApiProperty()
  referenceReason?: string;
  @ApiProperty()
  isViewed?: boolean;
  @ApiProperty()
  status?: ApplicationStatusEnums;
  @ApiProperty()
  remark?: string;
  @ApiProperty()
  tags?: string[];
  @ApiProperty()
  notification?: string;
  @ApiProperty()
  questionaryScore?: number;
  @ApiProperty()
  applicationInformation: any;
  @ApiProperty()
  isInvited?: boolean;
  @ApiProperty()
  userInfo?: any;
  static fromDto(dto: CreateApplicationCommand): ApplicationEntity {
    const entity = new ApplicationEntity();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.userId = dto.userId;
    entity.JobPostId = dto.JobPostId;
    entity.coverLetter = dto?.coverLetter;
    entity.applicationInformation = dto?.applicationInformation;
    entity.userInfo = dto?.userInfo;
    entity.isViewed = dto?.isViewed;
    entity.remark = dto?.remark;
    entity.tags = dto?.tags;
    entity.status = dto?.status;
    entity.notification = dto?.notification;
    entity.questionaryScore = dto?.questionaryScore;
    entity.referralInformation = dto?.referralInformation;
    entity.referenceReason = dto?.referenceReason;
    entity.isInvited = dto?.isInvited;
    entity.viewCount = dto?.viewCount;
    return entity;
  }
  static fromDtos(dto: CreateApplicationCommand[]): ApplicationEntity[] {
    return dto?.map((d) => CreateApplicationCommand.fromDto(d));
  }
}
export class UpdateApplicationCommand extends CreateApplicationCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class ChangeApplicationStatus {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  status: ApplicationStatusEnums;
}
export class PrepareScheduleCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  jobPostId: string;
  @ApiProperty()
  @IsNotEmpty()
  interviewersEmail?: string;
  @ApiProperty()
  @IsNotEmpty()
  oneInterviewDuration?: number;
  @ApiProperty()
  numberOfInterviewingGroup: number;
}
export class NotifyScheduleCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  jobPostId: string;
  @ApiProperty()
  @IsNotEmpty()
  interviewEmail: string;
  @ApiProperty()
  @IsNotEmpty()
  startTime: Date;
  @ApiProperty()
  @IsNotEmpty()
  endTime: Date;
  @ApiProperty()
  @IsNotEmpty()
  Subject: string;
}
export class NotificationInformation {
  data: NotifyScheduleCommand[];
  scheduleInformation: ScheduleInformation;
}
export class ScheduleInformation {
  orgLocation: string;
  userFullName: string;
  orgName: string;
  jobPostTitle: string;
  description: string;
  emailTitle: string;
  orgEmail: string;
  // date: Date;
}
export class ICalenderCommand {
  description: string;
  end: Date;
  start: Date;
  organizerEmail: string;
  organizerName: string;
  summary: string;
  uid: string;
  location: string;
  orgEmail: string;
  // date: Date;
}
export class UpdateApplicationView {
  @ApiProperty()
  ids: string[];
}


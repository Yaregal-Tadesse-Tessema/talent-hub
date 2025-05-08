/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
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
  id?: string;
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  userId: string;
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  JobPostId: string;
  @ApiProperty()
  coverLetter: string;
  @ApiProperty()
  referralInformation: ReferralInformation;
  @ApiProperty()
  referenceReason: string;
  @ApiProperty()
  isViewed?: boolean;
  @ApiProperty()
  status?: ApplicationStatusEnums;
  @ApiProperty()
  remark?: string;
  @ApiProperty()
  notification?: string;
  @ApiProperty()
  questionaryScore?: number;
  @ApiProperty()
  applicationInformation: any;
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
    entity.status = dto?.status;
    entity.notification = dto?.notification;
    entity.questionaryScore = dto?.questionaryScore;
    entity.referralInformation = dto?.referralInformation;
    entity.referenceReason = dto?.referenceReason;
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

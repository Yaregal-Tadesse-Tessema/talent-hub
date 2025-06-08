/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { NotificationEntity } from '../../persistencies/notification.entity';
import { DeliveryTypeEnums, NotificationTypeEnums } from '../email.command';
export class CreateNotificationCommand {
  id?: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  senderId: string;
  @ApiProperty()
  type: NotificationTypeEnums;
  @ApiProperty()
  notificationType: DeliveryTypeEnums;
 @ApiProperty()
  message: string;
   @ApiProperty()
  isRead: string;
   @ApiProperty()
  link: string;
  static fromDto(dto: CreateNotificationCommand): NotificationEntity {
    const entity = new NotificationEntity();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.userId = dto.userId;
    entity.senderId = dto.senderId;
    entity.type = dto?.type;
    entity.notificationType = dto?.notificationType;
    entity.message = dto?.message;
    entity.isRead = dto?.isRead;
    entity.link = dto?.link;
    return entity;
  }

  /**
   * Transfer list of DTO object to Entity  list
   *
   */
  static fromDtos(dto: CreateNotificationCommand[]): NotificationEntity[] {
    return dto?.map((d) => CreateNotificationCommand.fromDto(d));
  }
}
export class UpdateNotificationCommand extends CreateNotificationCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}


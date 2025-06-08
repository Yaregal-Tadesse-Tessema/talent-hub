/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryTypeEnums, NotificationTypeEnums } from '../email.command';
import { UserResponse } from 'src/modules/user/usecase/user.response';
import { LookupResponse } from 'src/modules/tenant/usecases/lookup/lookup.response';
import { NotificationEntity } from '../../persistencies/notification.entity';
export class NotificationResponse {
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
  user: UserResponse;
  sender: LookupResponse;

  static toResponse(dto: NotificationEntity): NotificationResponse {
    const response = new NotificationResponse();
    if (!dto) {
      return null;
    }
    response.id = dto?.id;
    response.userId = dto.userId;
    response.senderId = dto.senderId;
    response.type = dto.type;
    response.notificationType = dto.notificationType;
    response.message = dto.message;
    response.isRead = dto.isRead;
    response.link = dto.link;
    response.senderId = dto.senderId;
    if (dto.user) {
      response.user = UserResponse.toResponse(dto.user);
    }
    if (dto.sender) {
      response.sender = LookupResponse.toResponse(dto.sender);
    }
    return response;
  }
}

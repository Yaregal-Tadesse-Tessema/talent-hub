/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { NotificationService } from '../usecase/notificatoin/notification.usecase.service';
import {
  CreateNotificationCommand,
  UpdateNotificationCommand,
} from '../usecase/notificatoin/notification.command';
import { UserInfo } from 'src/libs/Common/user-information';
import { userInfo } from 'src/modules/auth/local-auth.guard';
@Controller('notifications')
@ApiTags('notifications')
@ApiExtraModels(DataResponseFormat)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Post()
  async saveNotification(@Body() command: CreateNotificationCommand,@userInfo()currentUser:UserInfo) {
    command.senderId=currentUser.id
    return await this.notificationService.createNotification(command);
  }
  @Put()
  async updateNotification(@Body() command: UpdateNotificationCommand) {
    return await this.notificationService.UpdateNotification(command);
  }
  @Get()
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getNotifications(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.notificationService.getNotifications(query);
  }
  @Get('get-count')
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getNotificationCount(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.notificationService.getNotificationCounts(query);
  }
  @Delete('/:id')
  async deleteNotifications(@Param('id') id?: string) {
    return await this.notificationService.deleteNotification(id);
  }
  @Delete('archive/:id')
  async archiveNotifications(@Param('id') id?: string) {
    return await this.notificationService.archiveNotification(id);
  }
}

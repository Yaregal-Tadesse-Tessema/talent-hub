/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';

import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { NotificationRepository } from '../../persistencies/notification.repository';
import {
  CreateNotificationCommand,
  UpdateNotificationCommand,
} from './notification.command';
import { NotificationResponse } from './notification.response';
import { NotificationStatusEnums } from '../email.command';
@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}
  async createNotification(command: CreateNotificationCommand) {
    const saveJobPostEntity = CreateNotificationCommand.fromDto(command);
    const result = await this.notificationRepository.create(saveJobPostEntity);
    return NotificationResponse.toResponse(result);
  }
  async UpdateNotification(command: UpdateNotificationCommand) {
    const notification = await this.notificationRepository.getOneByCriteria({
      id: command.id,
    });
    if (!notification)
      throw new NotFoundException(`notification doesn't exist`);
    const notificationEntity = UpdateNotificationCommand.fromDto(command);
    const result = await this.notificationRepository.create(notificationEntity);
    return result;
  }
  async getNotifications(query: CollectionQuery) {
    const jobPostExists = await this.notificationRepository.findAll(query);
    return jobPostExists;
  }
  async archiveNotification(id: string) {
    const jobPostExists = await this.notificationRepository.softDelete(id);
    return jobPostExists;
  }
  async deleteNotification(id: string) {
    const jobPostExists = await this.notificationRepository.delete(id);
    return jobPostExists;
  }
  async getNotificationCounts(query: CollectionQuery) {
    const jobPostExists = await this.notificationRepository.getCount(query);
    return jobPostExists;
  }
  async markAsView(query: CollectionQuery) {
    const unviwedNotifications =
      await this.notificationRepository.findAll(query);
    if (unviwedNotifications.items.length == 0) {
      const unReadNotifications =
        await this.notificationRepository.getManyByCriteria({
          status: NotificationStatusEnums.VIEWED,
        });
      if (unReadNotifications.length == 0) return null;
      return unReadNotifications;
    } else {
      const unviwedNotificationIds = unviwedNotifications.items.map(
        (item) => item.id,
      );
      await this.notificationRepository.updateMany(unviwedNotificationIds, {
        status: NotificationStatusEnums.VIEWED,
      });
      return unviwedNotifications;
    }
  }
  async markAsRead(id: string): Promise<NotificationResponse> {
    const unReadNotifications = await this.notificationRepository.findOne(id);
    if (!unReadNotifications)
      throw new NotFoundException(`Notification don't exist`);
    const result = await this.notificationRepository.update(
      unReadNotifications.id,
      {
        status: NotificationStatusEnums.READ,
      },
    );
    return NotificationResponse.toResponse(result);
  }
}

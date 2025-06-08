/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';

import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { NotificationRepository } from '../../persistencies/notification.repository';
import { CreateNotificationCommand, UpdateNotificationCommand } from './notification.command';
import { NotificationResponse } from './notification.response';
@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}
  async createNotification(command: CreateNotificationCommand) {
    const saveJobPostEntity = CreateNotificationCommand.fromDto(command);
    const result = await this.notificationRepository.create(saveJobPostEntity);
    return NotificationResponse.toResponse(result);
  }
  async UpdateNotification(command: UpdateNotificationCommand) {
    const notification = await this.notificationRepository.getOneByCriteria({
      id: command.id,
    });
    if (!notification) throw new NotFoundException(`notification doesn't exist`);
     const notificationEntity = UpdateNotificationCommand.fromDto(command);
    const result = await this.notificationRepository.create(notificationEntity);
    return result;
  }
  async getNotifications(query: CollectionQuery) {
    const jobPostExists = await this.notificationRepository.findAll(query);
    return jobPostExists;
  }
    async archiveNotification(id:string) {
    const jobPostExists = await this.notificationRepository.softDelete(id);
    return jobPostExists;
  }
   async deleteNotification(id:string) {
    const jobPostExists = await this.notificationRepository.delete(id);
    return jobPostExists;
  }
    async getNotificationCounts(query: CollectionQuery) {
    const jobPostExists = await this.notificationRepository.getCount(query);
    return jobPostExists;
  }
}

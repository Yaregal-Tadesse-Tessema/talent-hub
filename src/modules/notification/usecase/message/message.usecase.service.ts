/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { MessageRepository } from '../../persistencies/message.repository';
import { CreateMessageCommand, UpdateMessageCommand } from './message.command';
import { MessageResponse } from './message.response';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
  ) {}

  async getAll(query: CollectionQuery) {
    return await this.messageRepository.findAll(query);
  }
  async getById(id: string) {
    return await this.messageRepository.findOne(id);
  }
  async createMessage(command: CreateMessageCommand) {
    const userTenant =
      await this.messageRepository.create(command);
    return MessageResponse.toResponse(userTenant)
  }
  async updateMessage(command: UpdateMessageCommand) {
    const lookup = await this.messageRepository.findOne(
      command.id,
    );
    if (!lookup) throw new NotFoundException('User tenant does not exist');
    return await this.messageRepository.update(
      command.id,
      command,
    );
  }
  async archive(id: string) {
    const lookup = await this.messageRepository.findOne(id);
    if (!lookup) throw new NotFoundException('User tenant does not exist');
    const result = await this.messageRepository.softDelete(id);
    return result.affected > 0 ? true : false;
  }
}

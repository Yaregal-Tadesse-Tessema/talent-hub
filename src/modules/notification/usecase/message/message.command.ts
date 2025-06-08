/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { MessageEntity } from '../../persistencies/message.entity';
export class CreateMessageCommand {
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
  senderFullName: string;
  @ApiProperty()
  receiverFullName: string;
  @ApiProperty()
  senderEmployerId: string;
  @ApiProperty()
  senderUserId: string;
  @ApiProperty()
  receiverEmployerId: string;
  @ApiProperty()
  receiverUserId: string;
  @ApiProperty()
  content: string;
  @ApiProperty()
  @IsNotEmpty()
  applicationId: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  createdBy: string;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  updatedBy: string;
  currentUser?: any;
  static fromCommand(command: CreateMessageCommand): MessageEntity {
    const entity = new MessageEntity();
    entity.id = command?.id;
    entity.senderFullName = command.senderFullName;
    entity.receiverFullName = command.receiverFullName;
    entity.senderEmployerId = command.senderEmployerId;
    entity.senderUserId = command.senderUserId;
    entity.receiverEmployerId = command.receiverEmployerId;
    entity.receiverUserId = command.receiverUserId;
    entity.content = command.content;
    entity.applicationId = command.applicationId;

    entity.createdAt = command.createdAt;
    entity.createdBy = command.createdBy;

    entity.updatedAt = command.updatedAt;
    entity.updatedBy = command.updatedBy;
    return entity;
  }
}
export class UpdateMessageCommand extends CreateMessageCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}
export class ArchiveMessageCommand {
  @ApiProperty({
    example: 'uuid',
  })
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  reason: string;
  currentUser: any;
}

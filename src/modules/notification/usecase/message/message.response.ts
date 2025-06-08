/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { MessageEntity } from "../../persistencies/message.entity";
import { CreateMessageCommand } from "./message.command";

export class MessageResponse extends CreateMessageCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  static toResponse(entity:MessageEntity): MessageResponse {
    const response = new MessageResponse();
    response.id = entity?.id;
    response.receiverFullName = entity.receiverFullName;
    response.senderEmployerId = entity.senderEmployerId;
    response.senderUserId = entity.senderUserId;
    response.receiverEmployerId = entity.receiverEmployerId;
    response.receiverUserId = entity.receiverUserId;
    response.content = entity.content;
    response.applicationId = entity.applicationId;

    response.createdAt = entity.createdAt;
    response.createdBy = entity.createdBy;

    response.updatedAt = entity.updatedAt;
    response.updatedBy = entity.updatedBy;
    return response;
  }
}

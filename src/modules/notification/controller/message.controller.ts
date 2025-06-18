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
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { MessageResponse } from '../usecase/message/message.response';
import { MessageService } from '../usecase/message/message.usecase.service';
import { CreateMessageCommand, UpdateMessageCommand } from '../usecase/message/message.command';
import { userInfo } from 'src/modules/auth/local-auth.guard';
import { UserInfo } from 'src/libs/Common/user-information';
@Controller('messages')
@ApiTags('messages')
@ApiExtraModels(DataResponseFormat)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
  @Get()
  @ApiOkResponse({ type: MessageResponse })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getAll(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.messageService.getAll(query);
  }
  @Get('/:id')
  @ApiOkResponse({ type: MessageResponse })
  async getOne(@Param('id') id: string) {
    return await this.messageService.getById(id);
  }
  @Post()
  @ApiOkResponse({ type: MessageResponse })
  async create(@Body() command: CreateMessageCommand,@userInfo()currentUser:UserInfo) {
    // command.senderUserId=currentUser.id
    command.senderFullName =
      currentUser.firstName + ' ' + currentUser.middleName;
    command.currentUser = currentUser;
    return await this.messageService.createMessage(command);
  }
  @Put()
  @ApiOkResponse({ type: MessageResponse })
  async update(@Body() command: UpdateMessageCommand,@userInfo()currentUser:UserInfo) {
    command.currentUser=currentUser
    return await this.messageService.updateMessage(command);
  }
  @Delete('/:id')
  @ApiOkResponse({ type: Boolean })
  async delete(@Param('id') id: string) {
    return await this.messageService.archive(id);
  }
}
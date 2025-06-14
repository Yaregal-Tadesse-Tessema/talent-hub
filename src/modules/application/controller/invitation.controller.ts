/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { ApiPaginatedResponse } from 'src/libs/response-format/api-paginated-response';
import { InvitationService } from '../usecase/invitation/invitation.usecase.ervice';
import { CreateInvitationCommand, UpdateInvitationCommand } from '../usecase/invitation/invitation.command';
import { InvitationResponse } from '../usecase/invitation/invitation.response';
@Controller('invitations')
@ApiTags('invitations')
@ApiExtraModels(DataResponseFormat)
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
  ) {}
  @Post()
  async createInvitation(
    @Body() command: CreateInvitationCommand,
  ) {
    const result = await this.invitationService.create(command);
    return result;
  }
  @Put()
  async updateInvitation(@Body() command: UpdateInvitationCommand) {
    const result =
      await this.invitationService.update(command.id,command);
    return result;
  }
  @Get()
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  @ApiOkResponse({ type: InvitationResponse })
  async findAll(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<InvitationResponse>> {
    const query = decodeCollectionQuery(q);
    return await this.invitationService.findAll(query);
  }
  @Get(':id')
  @ApiQuery({
    name: 'i',
    type: String,
    description: 'includes. Optional',
    required: false,
  })
  @ApiOkResponse({ type: InvitationResponse })
  async findOne(
    @Param('id') id: string,
    @Req() req?: any,
    @Query('i') i?: string,
  ): Promise<InvitationResponse> {
    const relations = i ? i.split(',') : [];
    return this.invitationService.findOne(id, relations);
  }
  @Put(':id')
  @ApiOkResponse({ type: InvitationResponse })
  async update(
    @Param('id') id: string,
    @Body() itemData: UpdateInvitationCommand,
  ): Promise<InvitationResponse> {
    return this.invitationService.update(id, itemData);
  }
  @Delete(':id')
  async softDelete(@Param('id') id: string): Promise<boolean> {
    return this.invitationService.softDelete(id);
  }
  @Patch('restore/:id')
  async restore(@Param('id') id: string): Promise<boolean> {
    return this.invitationService.restore(id);
  }

  @Get('/archived/items')
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  @ApiPaginatedResponse(InvitationResponse)
  async findAllArchived(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<any>> {
    const query = decodeCollectionQuery(q);
    return this.invitationService.findAllArchived(query);
  }
 
}

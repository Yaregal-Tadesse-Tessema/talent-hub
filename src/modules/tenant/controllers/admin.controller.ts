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
import { AdminUserService } from '../usecases/admin/admin.usecase.command';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { AdminUSerResponse } from '../usecases/admin/admin.response';
import {
  CreateAdminCommand,
  UpdateAdminCommand,
} from '../usecases/admin/admin.command';
@Controller('admins')
@ApiTags('admins')
@ApiExtraModels(DataResponseFormat)
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}
  @Post()
  @ApiOkResponse({ type: AdminUSerResponse })
  async create(
    @Body() itemData: CreateAdminCommand,
  ): Promise<AdminUSerResponse> {
    return this.adminUserService.create(itemData);
  }

  @Get()
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async findAll(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<AdminUSerResponse>> {
    const query = decodeCollectionQuery(q);
    return this.adminUserService.findAll(query);
  }

  @Get(':id')
  @ApiQuery({
    name: 'i',
    type: String,
    description: 'includes. Optional',
    required: false,
  })
  async findOne(
    @Param('id') id: string,
    @Req() req?: any,
    @Query('i') i?: string,
  ): Promise<AdminUSerResponse> {
    const relations = i ? i.split(',') : [];
    return this.adminUserService.findOne(id, relations);
  }

  @Put(':id')
  @ApiOkResponse({ type: AdminUSerResponse })
  async update(
    @Param('id') id: string,
    @Body() itemData: UpdateAdminCommand,
  ): Promise<AdminUSerResponse> {
    return this.adminUserService.update(id, itemData);
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string): Promise<boolean> {
    return this.adminUserService.softDelete(id);
  }
  @Patch('restore/:id')
  async restore(@Param('id') id: string): Promise<boolean> {
    return this.adminUserService.restore(id);
  }

  @Get('/archived/items')
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async findAllArchived(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<AdminUSerResponse>> {
    const query = decodeCollectionQuery(q);
    return this.adminUserService.findAllArchived(query);
  }
}
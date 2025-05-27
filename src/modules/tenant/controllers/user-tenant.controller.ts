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

import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { UserTenantService } from '../usecases/user-enant/user-tenant.usecase.command';
import { CreateUserTenantCommand, UpdateUserTenantCommand } from '../usecases/user-enant/user-tenant.command';
import { UserTenantResponse } from '../usecases/user-enant/user-tenant.response';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
@Controller('user-tenants')
@ApiTags('user-tenants')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class UserTenantController {
  constructor(private readonly userTenantService: UserTenantService) {}
  @Get()
  @ApiOkResponse({ type: UserTenantResponse })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getAll(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.userTenantService.getAll(query);
  }
  @Get('/:id')
  @ApiOkResponse({ type: UserTenantResponse })
  async getOne(@Param('id') id: string) {
    return await this.userTenantService.getById(id);
  }
  @Post()
  @ApiOkResponse({ type: UserTenantResponse })
  async create(@Body() command: CreateUserTenantCommand) {
    return await this.userTenantService.createUserTenant(command);
  }
  @Put()
  @ApiOkResponse({ type: UserTenantResponse })
  async update(@Body() command: UpdateUserTenantCommand) {
    return await this.userTenantService.updateUserTenant(command);
  }
  @Delete('/:id')
  @ApiOkResponse({ type: Boolean })
  async delete(@Param('id') id: string) {
    return await this.userTenantService.archive(id);
  }
}
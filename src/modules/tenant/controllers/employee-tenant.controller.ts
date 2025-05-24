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
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';

import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { EmployeeTenantService } from '../usecases/employee-tenant/employee-tenant.usecase.command';
import { EmployeeTenantResponse } from '../usecases/employee-tenant/employee-tenant.response';
import {
  CreateEmployeeTenantCommand,
  UpdateEmployeeTenantCommand,
} from '../usecases/employee-tenant/employee-tenant.command';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
@Controller('employee-tenants')
@ApiTags('employee-tenants')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class EmployeeTenantController {
  constructor(private readonly employeeTenantService: EmployeeTenantService) {}
  @Get()
  @ApiOkResponse({ type: EmployeeTenantResponse })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getAll(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.employeeTenantService.getAll(query);
  }
  @Get('/:id')
  @ApiOkResponse({ type: EmployeeTenantResponse })
  async getOne(@Param('id') id: string) {
    return await this.employeeTenantService.getById(id);
  }
  @Post()
  @ApiOkResponse({ type: EmployeeTenantResponse })
  async create(@Body() command: CreateEmployeeTenantCommand) {
    return await this.employeeTenantService.createEmployeeTenant(command);
  }
  @Put()
  @ApiOkResponse({ type: EmployeeTenantResponse })
  async update(@Body() command: UpdateEmployeeTenantCommand) {
    return await this.employeeTenantService.updateLookup(command);
  }
  @Delete('/:id')
  @ApiOkResponse({ type: Boolean })
  async delete(@Param('id') id: string) {
    return await this.employeeTenantService.archive(id);
  }
}
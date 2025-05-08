/* eslint-disable prettier/prettier */
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
  } from '@nestjs/common';
  import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
  import { DataResponseFormat } from 'src/libs/response-format/data-response-format';

  import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { EmployeeTenantService } from '../usecases/employee-tenant/employee-tenant.usecase.command';
import { EmployeeTenantResponse } from '../usecases/employee-tenant/employee-tenant.response';
import { CreateEmployeeTenantCommand, UpdateEmployeeTenantCommand } from '../usecases/employee-tenant/employee-tenant.command';
  @Controller('employee-tenants')
  @ApiTags('employee-tenants')
  @ApiExtraModels(DataResponseFormat)
  @AllowAnonymous()
  export class EmployeeTenantController {
    constructor(
      private readonly employeeTenantService: EmployeeTenantService,
    ) {}
    @Get()
    @ApiOkResponse({ type: EmployeeTenantResponse })
    async getAll() {
      return await this.employeeTenantService.getAll();
    }
    @Get('/:id')
    @ApiOkResponse({ type: EmployeeTenantResponse })
    async getOne(@Param('id') id: string) {
      return await this.employeeTenantService.getById(id);
    }
    @Post()
    @ApiOkResponse({ type: EmployeeTenantResponse })
    async create(@Body() command: CreateEmployeeTenantCommand) {
      return await this.employeeTenantService.createLookup(command);
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
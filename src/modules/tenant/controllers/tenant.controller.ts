/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';

import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { TenantService } from '../usecases/tenant/tenant.usecase.command';
import { TenantResponse } from '../usecases/tenant/tenant.response';
import { CheckOrganizationFromETrade, CreateTenantCommand } from '../usecases/tenant/tenant.command';

@Controller('tenants')
@ApiTags('tenants')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post('create-account')
  @ApiOkResponse({ type: TenantResponse })
  async createAccount(@Body() command: CreateTenantCommand) {
    return await this.tenantService.CreateAccounts(command);
  }
  @Post('create-account-from-trade')
  @ApiOkResponse({ type: TenantResponse })
  async registerOrganizationWithETrade(
    @Body() command: CheckOrganizationFromETrade,
  ) {
    return await this.tenantService.registerOrganizationWithETrade(command);
  }
  @Get()
  @AllowAnonymous()
  @ApiOkResponse({ type: TenantResponse })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getTenants(
    @Body() command: CreateTenantCommand,
    @Query('q') q?: string,
  ) {
    const query = decodeCollectionQuery(q);
    return await this.tenantService.getTenants(query);
  }
  @Get('/:id')
  @ApiOkResponse({ type: TenantResponse })
  async getTenant(@Param('id') id: string) {
    return await this.tenantService.getTenant(id);
  }
}
/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { TenantService } from '../services/tenant.service';
import { CreateTenantCommand, TenantResponse } from '../dtos/tenant.dto';

@Controller('tenants')
@ApiTags('tenants')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post('create-account')
  @AllowAnonymous()
  @ApiOkResponse({ type: TenantResponse })
  async createAccount(@Body() command: CreateTenantCommand) {
    return await this.tenantService.CreateAccounts(command);
  }
}

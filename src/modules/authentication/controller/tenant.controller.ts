/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { TenantService } from '../services/tenant.service';

@Controller('tenants')
@ApiTags('tenants')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}
}

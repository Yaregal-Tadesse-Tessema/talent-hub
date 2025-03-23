/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { TenantEntity } from '../persistances/tenant.entity';
import { CreateTenantCommand, UpdateTenantCommand } from '../dtos/tenant.dto';
import { TenantService } from '../services/tenant.service';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';

const options: EntityCrudOptions = {
  createDto: CreateTenantCommand,
  updateDto: UpdateTenantCommand,
//   responseFormat: Tenan,
};
@Controller('tenants')
@ApiTags('tenants')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class TenantController extends CommonCrudController<TenantEntity>(
  options,
) {
  constructor(private readonly tenantService: TenantService) {
    super(tenantService);
  }
}

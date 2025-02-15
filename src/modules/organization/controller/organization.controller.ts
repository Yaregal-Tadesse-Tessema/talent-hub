import { Body, Controller, Post } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { CreateOrganizationCommand, UpdateOrganizationCommand } from '../usecase/organization.command';
import { OrganizationResponse } from '../usecase/organization.response';
import { OrganizationService } from '../usecase/organization.usecase.service';
import { OrganizationEntity } from '../persistencies/organization.entity';
const options: EntityCrudOptions = {
  createDto: CreateOrganizationCommand,
  updateDto: UpdateOrganizationCommand,
  responseFormat: OrganizationResponse,
};
@Controller('organizations')
@ApiTags('organizations')
@ApiExtraModels(DataResponseFormat<OrganizationResponse>)
export class OrganizationController extends CommonCrudController<OrganizationEntity>(
  options,
) {
  constructor(
    private readonly organizationService: OrganizationService,
  ) {
    super(organizationService);
  }
}

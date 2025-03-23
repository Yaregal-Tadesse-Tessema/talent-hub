/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { LookupService } from '../services/look-up.service';
import { CreateLookupCommand, UpdateLookUpCommand } from '../dtos/lookup.dto';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { LookupEntity } from '../persistances/lookup.entity';
const options: EntityCrudOptions = {
  createDto: CreateLookupCommand,
  updateDto: UpdateLookUpCommand,
  //   responseFormat: Tenan,
};
@Controller('lookups')
@ApiTags('lookups')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class LookupController extends CommonCrudController<LookupEntity>(
  options,
) {
  constructor(private readonly lookupService: LookupService) {
    super(lookupService);
  }
}

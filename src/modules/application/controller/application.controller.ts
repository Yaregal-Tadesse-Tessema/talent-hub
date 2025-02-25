/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { ApplicationEntity } from '../persistences/application.entity';
import { ApplicationService } from '../usecase/application.usecase.service';
import { CreateApplicationCommand } from '../usecase/application.command';
import { UpdateAccountCommand } from 'src/modules/account/dtos/command.dto/account.dto';
import { ApplicationResponse } from '../usecase/application.response';

const options: EntityCrudOptions = {
  createDto: CreateApplicationCommand,
  updateDto: UpdateAccountCommand,
  responseFormat: ApplicationResponse,
};
@Controller('applications')
@ApiTags('applications')
@ApiExtraModels(DataResponseFormat)
export class ApplicationController extends CommonCrudController<ApplicationEntity>(
  options,
) {
  constructor(private readonly applicationService: ApplicationService) {
    super(applicationService);
  }
//   @Post('create-application')
//   async createJobPosting(@Body() command: CreateApplicationCommand) {
//     const result = await this.applicationService.createJobPosting(command);
//     return result;
//   }
}

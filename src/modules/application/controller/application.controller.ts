/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { ApplicationEntity } from '../persistences/application.entity';
import { ApplicationService } from '../usecase/application.usecase.service';
import { CreateApplicationCommand } from '../usecase/application.command';
import { ApplicationResponse } from '../usecase/application.response';
import { FileService } from 'src/modules/file/services/file.service';
import { FileInterceptor } from '@nestjs/platform-express';

const options: EntityCrudOptions = {
  createDto: CreateApplicationCommand,
  responseFormat: ApplicationResponse,
};
@Controller('applications')
@ApiTags('applications')
@ApiExtraModels(DataResponseFormat)
export class ApplicationController extends CommonCrudController<ApplicationEntity>(
  options,
) {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly fileService: FileService,
  ) {
    super(applicationService);
  }
  @Post('create-application')
  @UseInterceptors(FileInterceptor('file'))
  async createJobPosting(
    @Body() command: CreateApplicationCommand,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.applicationService.createApplication(
      command,
      file,
    );
    return result;
  }
}

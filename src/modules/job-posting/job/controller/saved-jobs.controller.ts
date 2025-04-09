/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import {
  CreateSavedJobsCommand,
  UnsaveJobPostCommand,
  UpdateSaveJobCommand,
} from '../usecase/saved-jobs.command';
import { SavedJobsResponse } from '../usecase/saved-jobs.response';
import { SaveJobEntity } from '../persistencies/save-job-post.entity';
import { SavedJobsService } from '../usecase/saved-jobs.usecase.service';
const options: EntityCrudOptions = {
  createDto: CreateSavedJobsCommand,
  updateDto: UpdateSaveJobCommand,
  responseFormat: SavedJobsResponse,
};
@Controller('save-jobs')
@ApiTags('save-jobs')
@ApiExtraModels(DataResponseFormat)
export class SaveJobController extends CommonCrudController<SaveJobEntity>(
  options,
) {
  constructor(private readonly savedJobsService: SavedJobsService) {
    super(savedJobsService);
  }
  @Put('unsave-job-post')
  async unsaveJobPost(@Body() command: UnsaveJobPostCommand) {
    return await this.savedJobsService.unsaveJobPost(command);
  }
}

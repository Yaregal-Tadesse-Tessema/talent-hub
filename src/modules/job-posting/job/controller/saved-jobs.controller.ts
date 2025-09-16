/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiExtraModels, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { UnsaveJobPostCommand } from '../usecase/saved-jobs.command';
import { SavedJobsService } from '../usecase/saved-jobs.usecase.service';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';

@Controller('saved-jobs')
@ApiTags('saved-jobs')
@ApiExtraModels(DataResponseFormat)
export class SaveJobController {
  constructor(private readonly savedJobsService: SavedJobsService) {}
  @Put('save-job-post')
  async saveJobPost(@Body() command: UnsaveJobPostCommand) {
    return await this.savedJobsService.saveJobPost(command);
  }
  @Put('unsave-job-post')
  async unsaveJobPost(@Body() command: UnsaveJobPostCommand) {
    return await this.savedJobsService.unsaveJobPost(command);
  }
  @Get()
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getSavedJobPost(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.savedJobsService.getSavedJobPost(query);
  }
}

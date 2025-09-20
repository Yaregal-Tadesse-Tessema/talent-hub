/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiExtraModels, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { UnsaveJobPostCommand, CreateSavedJobsCommand } from '../usecase/saved-jobs.command';
import { SavedJobsService } from '../usecase/saved-jobs.usecase.service';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { userInfo } from 'src/modules/auth/local-auth.guard';
import { UserInfo } from 'src/libs/Common/user-information';

@Controller('saved-jobs')
@ApiTags('saved-jobs')
@ApiExtraModels(DataResponseFormat)
export class SaveJobController {
  constructor(private readonly savedJobsService: SavedJobsService) { }
  @Post('save')
  async saveJobPost(@Body() command: CreateSavedJobsCommand, @userInfo() user: UserInfo) {
    command.userId = user.id;
    return await this.savedJobsService.saveJobPost(command);
  }
  @Post('unsave')
  async unsaveJobPost(@Body() command: UnsaveJobPostCommand, @userInfo() user: UserInfo) {
    command.userId = user.id;
    return await this.savedJobsService.unsaveJobPost(command);
  }
  @Delete('unsave/:id')
  async deletesaveJobPost(@Param('id') id: string) {
    return await this.savedJobsService.deletesaveJobPost(id);
  }
  @Get()
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getSavedJobPost(@userInfo() user: UserInfo, @Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    query.where.push([
      {
        column: 'userId',
        operator: '=',
        value: user.id,
      },
    ]);
    return await this.savedJobsService.getSavedJobPost(query);
  }
}

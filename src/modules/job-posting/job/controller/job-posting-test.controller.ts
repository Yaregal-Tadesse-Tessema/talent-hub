/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ApiExtraModels, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JobPostingService } from '../usecase/job-posting.usecase.service';
import {
  ChangeJobPostStatusCommand,
  CreateJobPostingCommand,
  UpdateJobPostingCommand,
} from '../usecase/job-posting.command';
import { JobPostingResponse } from '../usecase/job-posting.response';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { userInfo } from 'src/modules/auth/local-auth.guard';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';

const options: EntityCrudOptions = {
  createDto: CreateJobPostingCommand,
  updateDto: UpdateJobPostingCommand,
  responseFormat: JobPostingResponse,
};
@Controller('jobs-test')
@ApiTags('jobs-test')
@ApiExtraModels(DataResponseFormat)
export class JobPostingController {
  constructor(
    private readonly jobPostingCommand: JobPostingService,
    // private readonly jobPostingCommand: JobPostingCommand,
  ) {
  }
  @Post('create-job-posting')
  async createJobPosting(@Body() command: CreateJobPostingCommand) {
    const result = await this.jobPostingCommand.createJobPosting(command);
    return result;
  }
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  @Get('get-all-job-postings')
  async getAllJobPosting(@userInfo() userInfo: any, @Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    const result = await this.jobPostingCommand.getJobPostings(query, userInfo);
    return result;
  }
  @Get('get-all-job-postings-by-skills')
  async getAllJobPostingBySkills(
    @userInfo() userInfo: any,
    @Query('q') q?: string,
  ) {
    const query = decodeCollectionQuery(q);
    const result = await this.jobPostingCommand.getJobPostingsBySkill(
      query,
      userInfo,
    );
    return result;
  }
  @Put('change-job-post-status')
  async changeJobPostStatus(@Body() command: ChangeJobPostStatusCommand) {
    const result = await this.jobPostingCommand.changeJobPostStatus(command);
    return result;
  }
}

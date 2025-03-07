/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiExtraModels, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
import { JobPostingService } from '../usecase/job-posting.usecase.service';
import {
  CreateJobPostingCommand,
  UpdateJobPostingCommand,
} from '../usecase/job-posting.command';
import { JobPostingResponse } from '../usecase/job-posting.response';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { userInfo } from 'src/modules/auth/local-auth.guard';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';

const options: EntityCrudOptions = {
  createDto: CreateJobPostingCommand,
  updateDto: UpdateJobPostingCommand,
  responseFormat: JobPostingResponse,
};
@Controller('job-postings')
@ApiTags('job-postings')
@ApiExtraModels(DataResponseFormat)
export class JobPostingController extends CommonCrudController<JobPostingEntity>(
  options,
) {
  constructor(private readonly jobPostingService: JobPostingService) {
    super(jobPostingService);
  }
  @Post('create-job-posting')
  async createJobPosting(@Body() command: CreateJobPostingCommand) {
    command.currentUser = userInfo;
    const result = await this.jobPostingService.createJobPosting(command);
    return result;
  }
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  @Get('get-all-job-postings')
  async getAllJobPosting(
    @Query('q') q?: string,
    // @userInfo() userInfo: UserInfo
  ) {
    const query = decodeCollectionQuery(q);
    const result = await this.jobPostingService.getJobPostings(query);
    return result;
  }
  @Get('get-all-job-postings-by-skills')
  async getAllJobPostingBySkills(
    @userInfo() userInfo: any,
    @Query('q') q?: string
  ) {
    const query = decodeCollectionQuery(q);
    const result = await this.jobPostingService.getJobPostingsBySkill(query,userInfo);
    return result;
  }
}

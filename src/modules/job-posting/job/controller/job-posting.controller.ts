/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ChangeJobPostStatusCommand,
  CreateJobPostingCommand,
} from '../usecase/job-posting.command';
import { JobPostingResponse } from '../usecase/job-posting.response';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { userInfo } from 'src/modules/auth/local-auth.guard';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { JobPostingService } from '../usecase/job-posting.usecase.service';

@Controller('jobs')
@ApiTags('jobs')
@ApiExtraModels(DataResponseFormat)
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) {}
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
  async getAllJobPosting(@userInfo() userInfo: any, @Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    const result = await this.jobPostingService.getJobPostings(query, userInfo);
    return result;
  }
  @AllowAnonymous()
  @Get('get-all-public-job-postings')
  async getAllPublicJobPosting(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    const result = await this.jobPostingService.getAllJobPostings(query);
    return result;
  }
  @Get('get-all-job-postings-by-skills')
  async getAllJobPostingBySkills(
    @userInfo() userInfo: any,
    @Query('q') q?: string,
  ) {
    const query = decodeCollectionQuery(q);
    const result = await this.jobPostingService.getJobPostingsBySkill(
      query,
      userInfo,
    );
    return result;
  }
  @Put('change-job-post-status')
  async changeJobPostStatus(@Body() command: ChangeJobPostStatusCommand) {
    const result = await this.jobPostingService.changeJobPostStatus(command);
    return result;
  }
  @Get(':id')
  @ApiQuery({
    name: 'i',
    type: String,
    description: 'includes. Optional',
    required: false,
  })
  @ApiOkResponse({ type: JobPostingResponse })
  async getOne(
    @Param('id') id: string,
    @Query('i') i?: string,
  ): Promise<JobPostingResponse> {
    const relations = i ? i.split(',') : [];
    return this.jobPostingService.getOne(id, relations);
  }
}

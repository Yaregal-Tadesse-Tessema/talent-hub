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
  JobPostFeaturingCOmmand,
  UpdateJobPostingCommand,
} from '../usecase/job-posting.command';
import { JobPostingResponse } from '../usecase/job-posting.response';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { userInfo } from 'src/modules/auth/local-auth.guard';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { JobPostingService } from '../usecase/job-posting.usecase.service';
import { UserAlertConfiguration } from 'src/modules/user/usecase/user.command';

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
  @Put('update-job-posting')
  async updateJobPosting(@Body() command: UpdateJobPostingCommand) {
    command.currentUser = userInfo;
    const result = await this.jobPostingService.updateJobPosting(command);
    return result;
  }
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  @Get('get-all-tenant-job-postings')
  async getAllJobPosting(@userInfo() userInfo?: any, @Query('q') q?: string) {
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
  @Get('get-application-count-by-job-post-id/:id')
  async getApplicationCountByJobPostId(@Param('id') id: string) {
    const result = await this.jobPostingService.getApplicationCountByJobPostId(id);
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
  @AllowAnonymous()
  async getOne(
    @Param('id') id: string,
    @Query('i') i?: string,
  ): Promise<JobPostingResponse> {
    const relations = i ? i.split(',') : [];
    return await this.jobPostingService.getOne(id, relations);
  }
  @Get('get-active-job-post/count')
  @AllowAnonymous()
  async getActiveJobPostCount(@Query('q') q?: string): Promise<number> {
    const query = decodeCollectionQuery(q);
    return await this.jobPostingService.getActiveJobsCount(query);
  }
  @Get('get-job-title/statistics')
  @AllowAnonymous()
  async getJobTitleStatistics(): Promise<any> {
    return await this.jobPostingService.getJobTitleStatistics();
  }
  @Get('get-job-industry/statistics')
  @AllowAnonymous()
  async getJobIndustryStatistics(): Promise<any> {
    return await this.jobPostingService.getJobIndustryStatistics();
  }
  @Put('make-job-post-featured')
  async makeJobPostFeatured(
    @Body() command: JobPostFeaturingCOmmand,
  ): Promise<any> {
    return await this.jobPostingService.makeJobPostFeatured(command);
  }
  @Get('get-user-by-job-post-and/property')
  @AllowAnonymous()
  async getUserByJobPostORProperty(): Promise<any> {
    const command: UserAlertConfiguration={
      industry:'Banking & Insurance',
      jobTitle:"Software Engineer",
      address:"Software Engineer",
      }
    return await this.jobPostingService.getUserByJobPostProperty(command);
  }
  @Get('get-user-by-job-post/property')
  @AllowAnonymous()
  async getUserByJobPostProperty(): Promise<any> {
    const command: UserAlertConfiguration={
    salary:"100000",
    Position:"string",
    industry:'Banking & Insurance',
    jobTitle:"Software Engineer",
    address:"Software Engineer",
    }
    return await this.jobPostingService.getUserByJobPostORProperty(command);
  }
}

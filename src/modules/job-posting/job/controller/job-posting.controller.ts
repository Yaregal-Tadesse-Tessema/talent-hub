import { Body, Controller, Post } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
import { JobPostingService } from '../usecase/job-posting.usecase.service';
import { CreateJobPostingCommand, UpdateJobPostingCommand } from '../usecase/job-posting.command';
import { JobPostingResponse } from '../usecase/job-posting.response';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';

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
  constructor(
    private readonly jobPostingService: JobPostingService,
  ) {
    super(jobPostingService);
  }
  @Post('create-job-posting')
  async createJobPosting(@Body()command:CreateJobPostingCommand){
const result=await this.jobPostingService.createJobPosting(command)
  }
}

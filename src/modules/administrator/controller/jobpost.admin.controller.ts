/* eslint-disable prettier/prettier */

import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';

import { FileInterceptor } from '@nestjs/platform-express';
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CreateAdminJobPostingCommand } from '../usecase/command';
import { JobPostAdminService } from '../usecase/jobpost.admin.service';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
@Controller('admin-job-posting')
@ApiTags('admin-job-posting')
@AllowAnonymous()
export class AdminJobPostingController {
  constructor(private readonly jobPostAdminService: JobPostAdminService) {}
  @Post('create-job-posting')
  async createJobPosting(
    @Body() command: CreateAdminJobPostingCommand,
  ) {
    const result = await this.jobPostAdminService.createJobPost(
      command
    );
    return result;
  }
}
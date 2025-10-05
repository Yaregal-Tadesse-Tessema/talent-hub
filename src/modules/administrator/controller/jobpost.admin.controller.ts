/* eslint-disable prettier/prettier */

import { ApiBody, ApiConsumes, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';

import { FilesInterceptor } from '@nestjs/platform-express';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AdminJobApplicationCommand, CreateAdminJobPostingCommand } from '../usecase/command';
import { JobPostAdminService } from '../usecase/jobpost.admin.service';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { UserInfo } from 'src/libs/Common/user-information';
import { userInfo } from 'src/modules/auth/local-auth.guard';
@Controller('admin-job-posting')
@ApiTags('admin-job-posting')
// @AllowAnonymous()
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

  @Post('apply-to-job')
  // @AllowAnonymous()
  @UseInterceptors(FilesInterceptor('files'))
  async applyToJob(
    @Body() command: AdminJobApplicationCommand,
    @UploadedFiles() files: Express.Multer.File[],
    @userInfo() user: UserInfo,
  ) {
    command.userId = user.id;
    const result = await this.jobPostAdminService.applyToJobByAdmin(
      command,
      files)
    return result;
  }

  @Get()
  @AllowAnonymous()
  async listAdminJobPosts(@Body('tenantName') tenantName?: string) {
    const result = await this.jobPostAdminService.getAdminJobPosts(tenantName);
    return result;
  }

  @Get('get/:id')
  @AllowAnonymous()
  async getAdminJobPost(@Param('id') id: string) {
    const result = await this.jobPostAdminService.getAdminJobPostById(id);
    return result;
  }

  @Put('update-admin-job-posting')
  @AllowAnonymous()
  async updateAdminJobPost(
    @Body() payload: Partial<CreateAdminJobPostingCommand>,
  ) {
    const result = await this.jobPostAdminService.updateAdminJobPost(payload);
    return result;
  }

  @Post('delete/:id')
  @AllowAnonymous()
  async deleteAdminJobPost(@Param('id') id: string) {
    const result = await this.jobPostAdminService.deleteAdminJobPost(id);
    return result;
  }
}
/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import {
  ChangeApplicationStatus,
  CreateApplicationCommand,
  NotificationInformation,
  PrepareScheduleCommand,
  UpdateApplicationCommand,
} from '../usecase/application.command';
import { FileService } from 'src/modules/file/services/file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationService } from '../usecase/application.usecase.service';
import { ApplicationResponse } from '../usecase/application.response';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { ApiPaginatedResponse } from 'src/libs/response-format/api-paginated-response';
@Controller('applications')
@ApiTags('applications')
@ApiExtraModels(DataResponseFormat)
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly fileService: FileService,
  ) {}
  @Post('create-application')
  @UseInterceptors(FileInterceptor('file'))
  async createJobPosting(
    @Body() command: CreateApplicationCommand,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.applicationService.createApplication(
      command,
      file,
    );
    return result;
  }
  @Put('change-application-status')
  @UseInterceptors(FileInterceptor('file'))
  async changeApplicationStatus(@Body() command: ChangeApplicationStatus) {
    const result =
      await this.applicationService.updateApplicationStatus(command);
    return result;
  }
  @Get()
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  @ApiOkResponse({ type: ApplicationResponse })
  async findAll(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<ApplicationResponse>> {
    const query = decodeCollectionQuery(q);
    return await this.applicationService.findAll(query);
  }
  @Get(':id')
  @ApiQuery({
    name: 'i',
    type: String,
    description: 'includes. Optional',
    required: false,
  })
  @ApiOkResponse({ type: ApplicationResponse })
  async findOne(
    @Param('id') id: string,
    @Req() req?: any,
    @Query('i') i?: string,
  ): Promise<ApplicationResponse> {
    const relations = i ? i.split(',') : [];
    return this.applicationService.findOne(id, relations);
  }
  @Put(':id')
  @ApiOkResponse({ type: ApplicationResponse })
  async update(
    @Param('id') id: string,
    @Body() itemData: UpdateApplicationCommand,
  ): Promise<ApplicationResponse> {
    return this.applicationService.update(id, itemData);
  }
  @Delete(':id')
  async softDelete(@Param('id') id: string): Promise<boolean> {
    return this.applicationService.softDelete(id);
  }
  @Patch('restore/:id')
  async restore(@Param('id') id: string): Promise<boolean> {
    return this.applicationService.restore(id);
  }

  @Get('/archived/items')
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  @ApiPaginatedResponse(ApplicationResponse)
  async findAllArchived(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<any>> {
    const query = decodeCollectionQuery(q);
    return this.applicationService.findAllArchived(query);
  }
  @Post('schedule')
  @ApiPaginatedResponse(ApplicationResponse)
  async PrepareAndSendEmail(
    @Body() command: PrepareScheduleCommand,
  ): Promise<any> {
    return await this.applicationService.PrepareAndSendEmail(command);
  }
  @Post('notify-schedule')
  @ApiPaginatedResponse(ApplicationResponse)
  async notifySchedule(@Body() command: NotificationInformation): Promise<any> {
    return await this.applicationService.notifySchedule(command);
  }
}

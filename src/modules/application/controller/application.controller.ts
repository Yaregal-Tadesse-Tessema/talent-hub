/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiExtraModels, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import {
  ChangeApplicationStatus,
  CreateApplicationCommand,
} from '../usecase/application.command';
import { FileService } from 'src/modules/file/services/file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationService } from '../usecase/application.usecase.service';
import { ApplicationResponse } from '../usecase/application.response';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
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
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() itemData: CreateApplicationCommand,
  ): Promise<ApplicationResponse> {
    return await this.applicationService.create(itemData);
  }

  @Get()
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async findAll(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<ApplicationResponse>> {
    const query = decodeCollectionQuery(q);
    return await this.applicationService.findAll(query);
  }

  //   @Get(':id')
  //   @ApiQuery({
  //     name: 'i',
  //     type: String,
  //     description: 'includes. Optional',
  //     required: false,
  //   })
  //   @ApiOkResponse({ type: options?.responseFormat })
  //   async findOne(
  //     @Param('id') id: string,
  //     @Req() req?: any,
  //     @Query('i') i?: string,
  //   ): Promise<TEntity | undefined> {
  //     const relations = i ? i.split(',') : [];
  //     return this.service.findOne(id, relations);
  //   }

  //   @Put(':id')
  //   @ApiBody({ type: options?.updateDto })
  //   @ApiOkResponse({ type: options?.responseFormat })
  //   @UsePipes(new ValidationPipe({ transform: true }))
  //   async update(
  //     @Param('id') id: string,
  //     @Body() itemData: typeof options.updateDto,
  //   ): Promise<TEntity | undefined> {
  //     return this.service.update(id, itemData);
  //   }

  //   @Delete(':id')
  //   async softDelete(@Param('id') id: string): Promise<void> {
  //     return this.service.softDelete(id);
  //   }
  //   @Patch('restore/:id')
  //   async restore(@Param('id') id: string): Promise<void> {
  //     return this.service.restore(id);
  //   }

  //   @Get('/archived/items')
  //   @ApiQuery({
  //     name: 'q',
  //     type: String,
  //     description: 'Collection Query Parameter. Optional',
  //     required: false,
  //   })
  //   @ApiPaginatedResponse(options?.responseFormat)
  //   async findAllArchived(
  //     @Query('q') q?: string,
  //   ): Promise<DataResponseFormat<TEntity>> {
  //     const query = decodeCollectionQuery(q);
  //     return this.service.findAllArchived(query);
  //   }
}

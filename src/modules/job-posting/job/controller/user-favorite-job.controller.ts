/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { UserFavoriteJobService } from '../usecase/user-favorite-job.usecase.service';
import { UserFavoriteJobResponse } from '../usecase/user-favorite-job.response';
import {
  CreateUserFavoriteJobCommand,
  UpdateUserFavoriteJobCommand,
} from '../usecase/user-favorite-job.command';
@Controller('user-favorite-jobs')
@ApiTags('user-favorite-jobs')
@ApiExtraModels(DataResponseFormat)
export class UserFavoriteJobController {
  constructor(
    private readonly userFavoriteJobService: UserFavoriteJobService,
  ) {}
  @Get()
  @ApiOkResponse({ type: UserFavoriteJobResponse })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getAll(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.userFavoriteJobService.getAll(query);
  }
  @Get('get-count')
  @ApiOkResponse({ type: UserFavoriteJobResponse })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getCount(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.userFavoriteJobService.getCount(query);
  }
  @Get('/:id')
  @ApiOkResponse({ type: UserFavoriteJobResponse })
  async getOne(@Param('id') id: string) {
    return await this.userFavoriteJobService.getById(id);
  }
  @Post()
  @ApiOkResponse({ type: UserFavoriteJobResponse })
  async create(@Body() command: CreateUserFavoriteJobCommand) {
    return await this.userFavoriteJobService.createUserFavoriteJob(command);
  }
  @Put()
  @ApiOkResponse({ type: UserFavoriteJobResponse })
  async update(@Body() command: UpdateUserFavoriteJobCommand) {
    return await this.userFavoriteJobService.updateUserFavoriteJob(command);
  }
  @Delete('archive/:id')
  @ApiOkResponse({ type: Boolean })
  async archive(@Param('id') id: string) {
    return await this.userFavoriteJobService.archive(id);
  }
  @Delete('/:id')
  @ApiOkResponse({ type: Boolean })
  async delete(@Param('id') id: string) {
    return await this.userFavoriteJobService.delete(id);
  }
  @Post('restore/:id')
  @ApiOkResponse({ type: Boolean })
  async restore(@Param('id') id: string) {
    return await this.userFavoriteJobService.restore(id);
  }
}

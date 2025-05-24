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
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { LookupResponse } from '../usecases/lookup/lookup.response';
import { LookupService } from '../usecases/lookup/lookup.usecase.command';
import {
  CreateLookupCommand,
  UpdateLookupCommand,
} from '../usecases/lookup/lookup.command';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';

@Controller('lookups')
@ApiTags('lookups')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}
  @Get()
  @ApiOkResponse({ type: LookupResponse })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getAll(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.lookupService.getAll(query);
  }
  @Get('/:id')
  @ApiOkResponse({ type: LookupResponse })
  async getOne(@Param('id') id: string) {
    return await this.lookupService.getById(id);
  }
  @Post()
  @ApiOkResponse({ type: LookupResponse })
  async create(@Body() command: CreateLookupCommand) {
    return await this.lookupService.createLookup(command);
  }
  @Put()
  @ApiOkResponse({ type: LookupResponse })
  async update(@Body() command: UpdateLookupCommand) {
    return await this.lookupService.updateLookup(command);
  }
  @Delete('/:id')
  @ApiOkResponse({ type: Boolean })
  async delete(@Param('id') id: string) {
    return await this.lookupService.archiveLookup(id);
  }
}
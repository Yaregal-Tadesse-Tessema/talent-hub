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
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { PreScreeningQuestionService } from '../usecase/pre-screening-question/pre-screening-question.usecase.command';
import { PreScreeningQuestionResponse } from '../usecase/pre-screening-question/pre-screening-question.response';
import {
  CreatePreScreeningQuestionCommand,
  UpdatePreScreeningQuestionCommand,
} from '../usecase/pre-screening-question/pre-screening-question.command';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
@Controller('pre-screening-questions')
@ApiTags('pre-screening-questions')
@ApiExtraModels(DataResponseFormat)
export class PreScreeningQuestionController {
  constructor(
    private readonly preScreeningQuestionService: PreScreeningQuestionService,
  ) {}
  @Post()
  @ApiOkResponse({ type: PreScreeningQuestionResponse })
  async create(
    @Body() itemData: CreatePreScreeningQuestionCommand,
    @Req() req?: any,
  ): Promise<PreScreeningQuestionResponse> {
    return this.preScreeningQuestionService.create(itemData, req);
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
  ): Promise<DataResponseFormat<PreScreeningQuestionResponse>> {
    const query = decodeCollectionQuery(q);
    return this.preScreeningQuestionService.findAll(query);
  }

  @Get(':id')
  @ApiQuery({
    name: 'i',
    type: String,
    description: 'includes. Optional',
    required: false,
  })
  @ApiOkResponse({ type: PreScreeningQuestionResponse })
  async findOne(
    @Param('id') id: string,
    @Req() req?: any,
    @Query('i') i?: string,
  ): Promise<PreScreeningQuestionResponse> {
    const relations = i ? i.split(',') : [];
    return this.preScreeningQuestionService.findOne(id, relations);
  }

  @Put(':id')
  @ApiOkResponse({ type: PreScreeningQuestionResponse })
  async update(
    @Param('id') id: string,
    @Body() itemData: UpdatePreScreeningQuestionCommand,
  ): Promise<PreScreeningQuestionResponse> {
    return this.preScreeningQuestionService.update(id, itemData);
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string): Promise<boolean> {
    return this.preScreeningQuestionService.softDelete(id);
  }
  @Patch('restore/:id')
  async restore(@Param('id') id: string): Promise<boolean> {
    return this.preScreeningQuestionService.restore(id);
  }

  @Get('/archived/items')
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async findAllArchived(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<PreScreeningQuestionResponse>> {
    const query = decodeCollectionQuery(q);
    return this.preScreeningQuestionService.findAllArchived(query);
  }
}

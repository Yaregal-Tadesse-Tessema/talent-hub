import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  Query,
  Req,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { EntityCrudOptions } from './common-service-options';
import { CommonCrudService } from './common.service';
import { ApiPaginatedResponse } from 'src/libs/response-format/api-paginated-response';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { decodeCollectionQuery } from '../collection-query/query-converter';
// import { decodeCollectionQuery } from 'src/libs/collection-query/query-converter';
export function CommonCrudController<TEntity extends ObjectLiteral>(
  options?: EntityCrudOptions,
) {
  @Controller()
  @UseInterceptors(/* your interceptors if any */)
  @ApiBearerAuth()
  class CommonCrudControllerHost {
    constructor(public readonly service: CommonCrudService<TEntity>) {}

    @Post()
    @ApiBody({ type: options?.createDto })
    @UsePipes(new ValidationPipe({ transform: true }))
    // @ApiBody({ type: options?.createDto || BaseAPIDto })
    @ApiOkResponse({ type: options?.responseFormat })
    async create(
      @Body() itemData: typeof options.createDto,
      @Req() req?: any,
    ): Promise<TEntity> {
      return this.service.create(itemData, req);
    }

    @Get()
    @ApiQuery({
      name: 'q',
      type: String,
      description: 'Collection Query Parameter. Optional',
      required: false,
    })
    @ApiPaginatedResponse(options?.responseFormat)
    async findAll(
      @Query('q') q?: string,
    ): Promise<DataResponseFormat<TEntity>> {
      const query = decodeCollectionQuery(q);
      return this.service.findAll(query);
    }

    @Get(':id')
    @ApiQuery({
      name: 'i',
      type: String,
      description: 'includes. Optional',
      required: false,
    })
    @ApiOkResponse({ type: options?.responseFormat })
    async findOne(
      @Param('id') id: string,
      @Req() req?: any,
      @Query('i') i?: string,
    ): Promise<TEntity | undefined> {
      const relations = i ? i.split(',') : [];
      return this.service.findOne(id, relations);
    }

    @Put(':id')
    @ApiBody({ type: options?.updateDto })
    @ApiOkResponse({ type: options?.responseFormat })
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(
      @Param('id') id: string,
      // @Body() itemData: Partial<TEntity>,
      @Body() itemData: typeof options.updateDto,
      @Req() req?: any,
    ): Promise<TEntity | undefined> {
      return this.service.update(id, itemData, req);
    }

    @Delete(':id')
    async softDelete(@Param('id') id: string, @Req() req?: any): Promise<void> {
      return this.service.softDelete(id, req);
    }

    @Patch('restore/:id')
    async restore(@Param('id') id: string): Promise<void> {
      return this.service.restore(id);
    }

    @Get('/archived/items')
    @ApiQuery({
      name: 'q',
      type: String,
      description: 'Collection Query Parameter. Optional',
      required: false,
    })
    @ApiPaginatedResponse(options?.responseFormat)
    async findAllArchived(
      @Query('q') q?: string,
    ): Promise<DataResponseFormat<TEntity>> {
      const query = decodeCollectionQuery(q);
      return this.service.findAllArchived(query);
    }
  }

  return CommonCrudControllerHost;
}

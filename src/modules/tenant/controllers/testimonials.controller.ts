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
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { TestimonialsService } from '../usecases/testimonial/testimonial.usecase.command';
import { TestimonialsResponse } from '../usecases/testimonial/testimonial.response';
import { CreateTestimonialsCommand, UpdateTestimonialsCommand } from '../usecases/testimonial/testimonial.command';
@Controller('employee-tenants')
@ApiTags('employee-tenants')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}
  @Get()
  @ApiOkResponse({ type: TestimonialsResponse })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getAll(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.testimonialsService.getAll(query);
  }
  @Get('/:id')
  @ApiOkResponse({ type: TestimonialsResponse })
  async getOne(@Param('id') id: string) {
    return await this.testimonialsService.getById(id);
  }
  @Post()
  @ApiOkResponse({ type: TestimonialsResponse })
  async create(@Body() command: CreateTestimonialsCommand) {
    return await this.testimonialsService.createEmployeeTenant(command);
  }
  @Put()
  @ApiOkResponse({ type: TestimonialsResponse })
  async update(@Body() command: UpdateTestimonialsCommand) {
    return await this.testimonialsService.updateLookup(command);
  }
  @Delete('/:id')
  @ApiOkResponse({ type: Boolean })
  async delete(@Param('id') id: string) {
    return await this.testimonialsService.archive(id);
  }
}
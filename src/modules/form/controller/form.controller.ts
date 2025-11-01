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
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FormService } from '../usecase/form.service';
import {
  CreateFormCommand,
  UpdateFormCommand,
  FormFilterDto,
} from '../usecase/form.command';
import {
  FormResponse,
} from '../usecase/form.response';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { UserInfo } from 'src/libs/Common/user-information';
import { userInfo } from 'src/modules/auth/local-auth.guard';

@Controller('forms')
@ApiTags('forms')
@ApiExtraModels(DataResponseFormat, FormResponse)
export class FormController {
  constructor(private readonly formService: FormService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new form' })
  @ApiOkResponse({ type: FormResponse })
  async create(@Body() command: CreateFormCommand,@userInfo() currentUser: UserInfo): Promise<FormResponse> {
    command.tenantId = currentUser.tenantId;
    return await this.formService.create(command);
  }
  @Put()
  @ApiOperation({ summary: 'Update a form' })
  @ApiOkResponse({ type: FormResponse })
  async update(
    @Body() command: UpdateFormCommand,
  ): Promise<FormResponse> {
    return await this.formService.update(command);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a form by ID' })
  @ApiOkResponse({ type: FormResponse })
  async findOne(@Param('id') id: string): Promise<FormResponse> {
    return await this.formService.findOne(id);
  }
  @Get()
  @ApiOperation({ summary: 'Get all forms' })
  @ApiOkResponse({ type: DataResponseFormat })
  async findAll(
    @Query() filter: FormFilterDto,
  ): Promise<DataResponseFormat<FormResponse>> {
    return await this.formService.findAll(filter);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a form' })
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.formService.delete(id);
    return { success: true };
  }
}


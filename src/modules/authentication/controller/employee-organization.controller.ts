/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { EmployeeOrganizationService } from '../services/employee-organization.service';
import {
  CreateEmployeeOrganizationCommand,
  EmployeeOrganizationResponse,
  UpdateEmployeeOrganizationCommand,
} from '../dtos/employee-organization';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
@Controller('employee-organizations')
@ApiTags('employee-organizations')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class EmployeeOrganizationController {
  constructor(
    private readonly employeeOrganizationService: EmployeeOrganizationService,
  ) {}
  @Get()
  @ApiOkResponse({ type: EmployeeOrganizationResponse })
  async getAll() {
    return await this.employeeOrganizationService.getAll();
  }
  @Get('/:id')
  @ApiOkResponse({ type: EmployeeOrganizationResponse })
  async getOne(@Param('id') id: string) {
    return await this.employeeOrganizationService.getById(id);
  }
  @Post()
  @ApiOkResponse({ type: EmployeeOrganizationResponse })
  async create(@Body() command: CreateEmployeeOrganizationCommand) {
    return await this.employeeOrganizationService.createLookup(command);
  }
  @Put()
  @ApiOkResponse({ type: EmployeeOrganizationResponse })
  async update(@Body() command: UpdateEmployeeOrganizationCommand) {
    return await this.employeeOrganizationService.updateLookup(command);
  }
  @Delete('/:id')
  @ApiOkResponse({ type: Boolean })
  async delete(@Param('id') id: string) {
    return await this.employeeOrganizationService.archive(id);
  }
}

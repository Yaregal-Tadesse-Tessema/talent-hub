/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { EmployeeOrganizationEntity } from '../persistances/employee-organization.entity';
import { EmployeeOrganizationService } from '../services/employee-organization.service';
import { CreateEmployeeOrganizationCommand, UpdateEmployeeOrganizationCommand } from '../dtos/employee-organization';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
const options: EntityCrudOptions = {
  createDto: CreateEmployeeOrganizationCommand,
  updateDto: UpdateEmployeeOrganizationCommand,
//   responseFormat: Tenan,
};
@Controller('employee-organizations')
@ApiTags('employee-organizations')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class EmployeeOrganizationController extends CommonCrudController<EmployeeOrganizationEntity>(
  options,
) {
  constructor(private readonly employeeOrganizationService: EmployeeOrganizationService) {
    super(employeeOrganizationService);
  }
}

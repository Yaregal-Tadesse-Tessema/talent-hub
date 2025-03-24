/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { AdminUserEntity } from '../persistances/admin-user.entity';
import { AdminUserService } from '../services/admin-user.service';
import { AdminUserResponse, CreateAdminUserCommand, UpdateAdminUserCommand } from '../dtos/admin-user.dto';
const options: EntityCrudOptions = {
  createDto: CreateAdminUserCommand,
  updateDto: UpdateAdminUserCommand,
  responseFormat: AdminUserResponse,
};
@Controller('admin-users')
@ApiTags('admin-users')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class AdminUserController extends CommonCrudController<AdminUserEntity>(
  options,
) {
  constructor(private readonly adminUserService: AdminUserService) {
    super(adminUserService);
  }
}

/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { AdminUserService } from '../usecases/admin/admin.usecase.command';
@Controller('admins')
@ApiTags('admins')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}
}
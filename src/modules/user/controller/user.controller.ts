/* eslint-disable prettier/prettier */
import {  Controller } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { CreateUserCommand, UpdateUserCommand } from '../usecase/user.command';
import { UserResponse } from '../usecase/user.response';
import { UserEntity } from '../persistence/users.entity';
import { UserService } from '../usecase/user.usecase.service';

const options: EntityCrudOptions = {
  createDto: CreateUserCommand,
  updateDto: UpdateUserCommand,
  responseFormat: UserResponse,
};
@Controller('users')
@ApiTags('users')
@ApiExtraModels(DataResponseFormat)
export class UserController extends CommonCrudController<UserEntity>(
  options,
) {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
 
}

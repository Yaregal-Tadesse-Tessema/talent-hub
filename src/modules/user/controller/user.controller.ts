/* eslint-disable prettier/prettier */
import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { CreateUserCommand, UpdateUserCommand } from '../usecase/user.command';
import { UserResponse } from '../usecase/user.response';
import { UserEntity } from '../persistence/users.entity';
import { UserService } from '../usecase/user.usecase.service';
import { FileInterceptor } from '@nestjs/platform-express';

const options: EntityCrudOptions = {
  createDto: CreateUserCommand,
  updateDto: UpdateUserCommand,
  responseFormat: UserResponse,
};
@Controller('users')
@ApiTags('users')
@ApiExtraModels(DataResponseFormat)
export class UserController extends CommonCrudController<UserEntity>(options) {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
  @Post('upload-profile/:userId')
  @UseInterceptors(FileInterceptor('file'))
  async createJobPosting(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.userService.uploadProfile(file, userId);
    return result;
  }
}

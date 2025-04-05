/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { UserService } from '../usecase/user.usecase.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';

@Controller('users')
@ApiTags('users')
@AllowAnonymous()
@ApiExtraModels(DataResponseFormat)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('upload-profile/:userId')
  @UseInterceptors(FileInterceptor('file'))
  async createJobPosting(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.userService.uploadProfile(file, userId);
    return result;
  }

  @Get('get-profile-completeness/:userId')
  async getProfileCompleteness(@Param('userId') userId: string) {
    const result = await this.userService.getProfileCompleteness(userId);
    return result;
  }
}

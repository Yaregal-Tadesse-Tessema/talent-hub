/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import {
  CreateUserCommand,
  CvTemplateEnums,
  UpdateUserCommand,
} from '../usecase/user.command';
import { UserResponse } from '../usecase/user.response';
import { UserEntity } from '../persistence/users.entity';
import { UserService } from '../usecase/user.usecase.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { Response } from 'express';
import { AccountPasswordChange } from 'src/modules/account/dtos/command.dto/account.dto';

const options: EntityCrudOptions = {
  createDto: CreateUserCommand,
  updateDto: UpdateUserCommand,
  responseFormat: UserResponse,
};
@Controller('users')
@ApiTags('users')
@AllowAnonymous()
@ApiExtraModels(DataResponseFormat)
export class UserController extends CommonCrudController<UserEntity>(options) {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
  @Post('upload-resume/:userId')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (
          !file.mimetype.match(
            /\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)$/,
          )
        ) {
          return cb(
            new BadRequestException('Only PDF and Word documents are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadResume(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.userService.uploadResumeByUserId(file, userId);
    return result;
  }
  @Post('upload-profile/:userId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.userService.uploadProfile(file, userId);
    return result;
  }
  @Post('convert-word-to-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async convertWordToPdf(@UploadedFile() file: Express.Multer.File) {
    const fileName = file.originalname;
    const result = await this.userService.convertWordToPdf(
      file.buffer,
      fileName,
    );
    return result;
  }
  @Get('get-profile-completeness/:userId')
  async getProfileCompleteness(@Param('userId') userId: string) {
    const result = await this.userService.getProfileCompleteness(userId);
    return result;
  }
  @Post('generate-cv-in-pdf/:template')
  async generatePayrollRunPdf(
    @Param('template') template: CvTemplateEnums,
    @Res() res: Response,
    @Body() command: any,
  ) {
    const fileName = await this.userService.generateCv(template, command);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.download('/tmp/' + fileName);
  }
  @Put('change-user-password')
  @AllowAnonymous()
  @ApiOkResponse({ type: UserResponse })
  async changePassword(@Body() command: AccountPasswordChange) {
    return await this.userService.changePassword(command);
  }
}

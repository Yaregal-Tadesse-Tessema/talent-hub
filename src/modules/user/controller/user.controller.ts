/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import {
  AccountPasswordChange,
  CreateUserCommand,
  CvTemplateEnums,
  UpdateUserCommand,
} from '../usecase/user.command';
import { UserResponse } from '../usecase/user.response';
import { UserService } from '../usecase/user.usecase.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { Response } from 'express';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';

@Controller('users')
@ApiTags('users')
@AllowAnonymous()
@ApiExtraModels(DataResponseFormat)
export class UserController {
  constructor(private readonly userService: UserService) {
    // super(userService);
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
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only jpeg/png files are allowed');
    }
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
  @Get('activate-account/:userId')
  @ApiOkResponse({ type: UserResponse })
  async activateAccount(
    @Query('token') token: string,
    @Res() res: Response,
    @Param('userId') userId: string,
  ) {
    return await this.userService.activateAccount(token, res, userId);
  }
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() itemData: CreateUserCommand): Promise<UserResponse> {
    return await this.userService.create(itemData);
  }
  @Get()
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async findAll(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<UserResponse>> {
    const query = decodeCollectionQuery(q);
    return await this.userService.findAll(query);
  }

  @Get(':id')
  @ApiQuery({
    name: 'i',
    type: String,
    description: 'includes. Optional',
    required: false,
  })
  async findOne(
    @Param('id') id: string,
    @Query('i') i?: string,
  ): Promise<UserResponse> {
    const relations = i ? i.split(',') : [];
    return await this.userService.findOne(id, relations);
  }

  @Put()
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Body() itemData: UpdateUserCommand): Promise<UserResponse> {
    return await this.userService.update(itemData);
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string): Promise<void> {
    return this.userService.softDelete(id);
  }
  @Patch('restore/:id')
  async restore(@Param('id') id: string): Promise<void> {
    return await this.userService.restore(id);
  }

  @Get('/archived/items')
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async findAllArchived(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<UserResponse>> {
    const query = decodeCollectionQuery(q);
    return await this.userService.findAllArchived(query);
  }
}

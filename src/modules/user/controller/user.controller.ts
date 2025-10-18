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
  AccountPasswordReset,
  CreateUserCommand,
  CvTemplateEnums,
  SendPasswordResetLinkCommand,
  UpdateUserCommand,
  UserAlertConfiguration,
} from '../usecase/user.command';
import { UserResponse } from '../usecase/user.response';
import { UserService } from '../usecase/user.usecase.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { Response } from 'express';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { userInfo } from 'src/modules/auth/local-auth.guard';
import { UserInfo } from 'src/libs/Common/user-information';

@Controller('users')
@ApiTags('users')
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
    if(!file) {
      throw new BadRequestException('File is required');
    }
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
  @AllowAnonymous()
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
  @AllowAnonymous()
  @Post('generate-cv-in-pdf/:template')
  async generateCv(
    @Param('template') template: CvTemplateEnums,
    @Res() res: Response,
    @Body() command: any,
  ) {
    const fileName = await this.userService.generateCv(template, command);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.download('/tmp/' + fileName);
  }
  @Put('change-user-password')
  @ApiOkResponse({ type: UserResponse })
  async changePassword(@Body() command: AccountPasswordChange) {
    return await this.userService.changePassword(command);
  }
  @AllowAnonymous()
  @Get('activate-account/:userId')
  @ApiOkResponse({ type: UserResponse })
  async activateAccount(
    @Query('token') token: string,
    @Res() res: Response,
    @Param('userId') userId: string,
  ) {
    console.log(token, userId);
    return await this.userService.activateAccount(token, res, userId);
  }
  @Post()
  @AllowAnonymous()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() itemData: CreateUserCommand): Promise<UserResponse> {
    const response= await this.userService.create(itemData);
    return response;
  }
  @Get()
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  @AllowAnonymous()
  async findAll(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<UserResponse>> {
    const query = decodeCollectionQuery(q);
    return await this.userService.findAllPublic(query);
  }
  @Get(':id')
  @AllowAnonymous()
  @ApiQuery({
    name: 'i',
    type: String,
    description: 'includes. Optional',
    required: false,
  })
  @AllowAnonymous()
  async findOne(
    @Param('id') id: string,
    @Query('i') i?: string,
  ): Promise<UserResponse> {
    const relations = i ? i.split(',') : [];
    return await this.userService.findOne(id, relations);
  }
  @Put()
  async update(@Body() itemData: UpdateUserCommand): Promise<UserResponse> {
    return await this.userService.update(itemData);
  }
  @Put('add-alert-configuration')
  async addAlertCOnfiguration(
    @Body() itemData: UserAlertConfiguration,
    @userInfo() user: UserInfo,
  ): Promise<UserResponse> {
    itemData.userId = user.id;
    return await this.userService.addAlertConfiguration(itemData);
  }
  @Put('alert/update-alert-configuration')
  async updateAlertConfiguration(
    @Body() itemData: UserAlertConfiguration,
    @userInfo() user: UserInfo,
  ): Promise<UserResponse> {
    itemData.userId = user.id;
    return await this.userService.updateAlertConfiguration(itemData);
  }
  @Get('alert/get-alert-configuration')
  async getAlertConfiguration(@userInfo() user: UserInfo): Promise<UserAlertConfiguration[]> {
    return await this.userService.getAlertConfiguration(user.id);
  }
  @Put('alert/delete-alert-configuration/:alertName')
  async removeAlertCOnfiguration(
   @Param('alertName') alertName: string,
   @userInfo() user: UserInfo,
  ): Promise<UserResponse> {
    const alertConfiguration: UserAlertConfiguration = {
      alertName: alertName,
      userId: user.id,
    }
    return await this.userService.deleteAlertCOnfiguration(alertName, user.id);
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
  @AllowAnonymous()
  async findAllArchived(
    @Query('q') q?: string,
  ): Promise<DataResponseFormat<UserResponse>> {
    const query = decodeCollectionQuery(q);
    return await this.userService.findAllArchived(query);
  }
  @AllowAnonymous()
  @Post('send-password-reset-email')
  async sendPasswordResetEmail(
    @Body() command: SendPasswordResetLinkCommand,
  ): Promise<{
    message: string,
    data: any,
  }> {
    
    return await this.userService.sendPasswordResetEmail(command);
  }
  @AllowAnonymous()
  @Post('reset-user-password')
  async ResetUserPasswordByEmail(
    @Body() command: AccountPasswordReset,
  ): Promise<UserResponse> {
    return await this.userService.resetUserPasswordByEmailOrPhone(command);
  }
  @Put('configure-user-sms-alert')
  async configureUserSmsAlert(
    @Body() command: UserAlertConfiguration[],
  ): Promise<UserResponse> {
    return await this.userService.configureUserSmsAlert(command);
  }
  @Get('inactive/older-than-two-months')
  @AllowAnonymous()
  async getUsersInactiveForTwoMonths(): Promise<UserResponse[]> {
    return await this.userService.getUsersInactiveForTwoMonths();
  }
}

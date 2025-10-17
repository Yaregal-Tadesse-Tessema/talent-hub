/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { LookupResponse } from '../usecases/lookup/lookup.response';
import { LookupService } from '../usecases/lookup/lookup.usecase.command';
import {
  ChangePasswordCommand,
  CreateLookupCommand,
  UpdateLookupCommand,
} from '../usecases/lookup/lookup.command';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { userInfo } from 'src/modules/auth/local-auth.guard';
import { UserInfo } from 'src/libs/Common/user-information';

@Controller('lookups')
@ApiTags('lookups')
@ApiExtraModels(DataResponseFormat)
export class LookupController {
  constructor(private readonly lookupService: LookupService) { }
  @Get()
  @ApiOkResponse({ type: LookupResponse })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  @AllowAnonymous()
  async getAll(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.lookupService.getAll(query);
  }
  @Get('/:id')
  @ApiOkResponse({ type: LookupResponse })
  @AllowAnonymous()
  async getOne(@Param('id') id: string) {
    return await this.lookupService.getById(id);
  }
  @Post()
  @AllowAnonymous()
  @ApiOkResponse({ type: LookupResponse })
  async create(@Body() command: CreateLookupCommand) {
    return await this.lookupService.createLookup(command);
  }
  @Put()
  @ApiOkResponse({ type: LookupResponse })
  @AllowAnonymous()
  async update(@Body() command: UpdateLookupCommand) {
    return await this.lookupService.updateLookup(command);
  }
  @Delete('/:id')
  @ApiOkResponse({ type: Boolean })
  @AllowAnonymous()
  async delete(@Param('id') id: string) {
    return await this.lookupService.delete(id);
  }
  @Put('upload-profile/:id')
  @AllowAnonymous()
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only jpeg/png files are allowed');
    }
    const result = await this.lookupService.uploadProfile(file, id);
    return result;
  }
  @Put('change-password')
  @ApiOkResponse({ type: LookupResponse })
  async changePassword(@Body() command: ChangePasswordCommand, @userInfo() user: UserInfo) {
    command.currentUser = user;
    return await this.lookupService.changePassword(command);
  }
  @Put('get-tenants-by-lookup-id/:lookupId')
  @AllowAnonymous()
  async getTenantsByLookupId(@Param('lookupId') lookupId: string) {
    const result = await this.lookupService.getTenantsByLookupId(lookupId);
    return result;
  }
  @AllowAnonymous()
  @Get('activate-account/:lookupId')
  @ApiOkResponse({ type: LookupResponse })
  async activateAccount(
    @Query('token') token: string,
    @Res() res: Response,
    @Param('lookupId') lookupId: string,
  ) {
    return await this.lookupService.activateAccount(token, res, lookupId);
  }
}
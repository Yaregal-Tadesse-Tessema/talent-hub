/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
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

import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { TenantService } from '../usecases/tenant/tenant.usecase.command';
import { TenantResponse } from '../usecases/tenant/tenant.response';
import {
  CheckOrganizationFromETrade,
  CreateTenantCommand,
} from '../usecases/tenant/tenant.command';
import { userInfo } from 'src/modules/auth/local-auth.guard';
import { UserInfo } from 'src/libs/Common/user-information';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('tenants')
@ApiTags('tenants')
@ApiExtraModels(DataResponseFormat)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOkResponse({ type: TenantResponse })
  async createAccount(
    @Body() command: CreateTenantCommand,
    @userInfo() currentUser: UserInfo,
  ) {
    command.currentUser = currentUser;
    return await this.tenantService.CreateAccounts(command);
  }
  @Post('create-account-from-trade')
  @ApiOkResponse({ type: TenantResponse })
  async registerOrganizationWithETrade(
    @Body() command: CheckOrganizationFromETrade,
    @userInfo() currentUser: UserInfo,
  ) {
    command.currentUser = currentUser;
    return await this.tenantService.registerOrganizationWithETrade(command);
  }
  @Get()
  @AllowAnonymous()
  @ApiOkResponse({ type: TenantResponse })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  async getTenants(
    @Body() command: CreateTenantCommand,
    @Query('q') q?: string,
  ) {
    const query = decodeCollectionQuery(q);
    return await this.tenantService.getTenants(query);
  }
  @Get('/:id')
  @ApiOkResponse({ type: TenantResponse })
  async getTenant(@Param('id') id: string) {
    return await this.tenantService.getTenant(id);
  }
  @Put('upload-logo/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only jpeg/png files are allowed');
    }
    const result = await this.tenantService.uploadLogo(file, id);
    return result;
  }
}
import {
  CollectionQuery,
  IncludeQuery,
} from '@libs/collection-query/collection-query';
import { ApiPaginatedResponse } from '@libs/response-format/api-paginated-response';
import { DataResponseFormat } from '@libs/response-format/data-response-format';
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  // UseGuards,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserInfo } from '@libs/common/user-info';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { TenantCommand } from '../usecase/tenant/tenant.usecase.command';
import { TenantQuery } from '../usecase/tenant/tenant.usecase.query';
import { TenantResponse } from '../usecase/tenant/tenant.response';
import {
  CreateTenantCommand,
  UpdateTenantCommand,
} from '../usecase/tenant/tenant.command';
import { FileInterceptor } from '@nestjs/platform-express';
import * as jwt from 'jsonwebtoken';
@Controller('tenants')
@ApiTags('tenants')
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiResponse({ status: 404, description: 'Item not found' })
@ApiExtraModels(DataResponseFormat)
export class TenantController {
  constructor(
    private command: TenantCommand,
    private tenantQuery: TenantQuery,
  ) {}
  @Get('get-tenant/:id')
  @ApiOkResponse({ type: TenantResponse })
  async getTenant(@Param('id') id: number, @Query() query: IncludeQuery) {
    return await this.tenantQuery.getTenant(id, query.includes);
  }
  @Get('get-tenants')
  @ApiOkResponse({ type: ApiPaginatedResponse })
  async getTenants(@Query() query: CollectionQuery) {
    return await this.tenantQuery.getTenants(query);
  }
  @Post('create-tenant')
  @ApiOkResponse({ type: TenantResponse })
  async createTenant(
    @CurrentUser() user: UserInfo,
    @Body() createTenantCommand: CreateTenantCommand,
  ) {
    createTenantCommand.currentUser = user;
    return await this.command.createTenant(createTenantCommand);
  }
  @Put('update-tenant')
  @ApiOkResponse({ type: TenantResponse })
  async approveTenant(
    @CurrentUser() user: UserInfo,
    @Body() updateTenantCommand: UpdateTenantCommand,
  ) {
    updateTenantCommand.currentUser = user;
    return await this.command.updateTenant(updateTenantCommand);
  }
  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserInfo,
  ): Promise<{ url: string }> {
    const url = await this.command.uploadFile(file, user.organizationId);
    return { url };
  }
  @Get('get-tenants-by-token')
  async getTenantsByToken(@Headers() headers: object){
    const authorization: string = headers['authorization'];
    const token = jwt.decode(authorization.split(' ')[1]);;
    return await this.command.getTenantsByToken(token)
  }
  @Put('update-wifi-info/:tenantId')
  async updateWifiInfo(
    @CurrentUser() user: UserInfo,
    @Body() wifiInfo: any,
    @Param("tenantId") tenantId: string,
  ){
    return await this.command.updateWifiInfo(wifiInfo,tenantId)
  }
  @Put('update-location/:tenantId')
  async updateLocation(
    @CurrentUser() user: UserInfo,
    @Body() wifiInfo: any,
    @Param("tenantId") tenantId: string,
  ){
    return await this.command.updateLocation(wifiInfo,tenantId)
  }
}

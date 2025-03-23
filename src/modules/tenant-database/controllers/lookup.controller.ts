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
  Param,
  Post,
  Put,
  Query,
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
import { LookUpResponse } from '../usecase/look-up/look-up.response';
import {
  CreateLookUpCommand,
  UpdateLookUpCommand,
} from '../usecase/look-up/look-up.command';
import { LookUpCommand } from '../usecase/look-up/look-up.usecase.command';
import { LookUpQuery } from '../usecase/look-up/look-up.usecase.query';

@Controller('lookups')
@ApiTags('lookups')
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiResponse({ status: 404, description: 'Item not found' })
@ApiExtraModels(DataResponseFormat)
export class LookUpController {
  constructor(
    private command: LookUpCommand,
    private lookUpQuery: LookUpQuery,
  ) {}
  @Get('get-lookup/:id')
  @ApiOkResponse({ type: LookUpResponse })
  async getLookUp(@Param('id') id: string, @Query() query: IncludeQuery) {
    return await this.lookUpQuery.getLookUp(id, query.includes);
  }
  @Get('get-lookup')
  @ApiOkResponse({ type: ApiPaginatedResponse })
  async getLookUps(@Query() query: CollectionQuery) {
    return await this.lookUpQuery.getLookUps(query);
  }
  @Post('create-lookup')
  @ApiOkResponse({ type: LookUpResponse })
  async createLookUp(
    @CurrentUser() user: UserInfo,
    @Body() createLookUpCommand: CreateLookUpCommand,
  ) {
    createLookUpCommand.currentUser = user;
    return await this.command.createLookUp(createLookUpCommand);
  }
  @Put('update-lookup')
  @ApiOkResponse({ type: LookUpResponse })
  async approveLoan(
    @CurrentUser() user: UserInfo,
    @Body() updateLookUpCommand: UpdateLookUpCommand,
  ) {
    updateLookUpCommand.currentUser = user;
    return await this.command.updateLookUp(updateLookUpCommand);
  }

  @Post('move-all-lookups-to-employee-organization')
  @ApiOkResponse({ type: LookUpResponse })
  async moveAllLookUpsTOEmployeeOrganization(@CurrentUser() user: UserInfo) {
    return await this.command.moveAllLookUpsToEmployeeOrganization(user);
  }

  @Post('delete-lookup/:lookupId/:tenantId')
  @ApiOkResponse({ type: LookUpResponse })
  async archiveLookup(
    @Param('lookupId') lookupId: string,
    @Param('tenantId') tenantId: number,
  ) {
    return await this.command.archiveLookup(lookupId, tenantId);
  }
  @Get('get-lookup/:lookupId/:tenantId')
  @ApiOkResponse({ type: LookUpResponse })
  async getOneLoopUpBy(
    @Param('lookupId') lookupId: string,
    @Param('tenantId') tenantId: number
  ) {
    return await this.lookUpQuery.getOneLoopUpBy(lookupId, tenantId);
  }
}

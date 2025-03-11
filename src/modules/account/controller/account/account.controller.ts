/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AccountQueryService } from '../../service/account-query.service';
import { AccountCommandService } from '../../service/account-command.service';
import { CheckOrganizationFromETrade } from '../../dtos/command.dto/account.dto';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { AccountResponse } from '../../dtos/response.dto/account.response.dto';
import { CreateOrganizationCommand } from 'src/modules/organization/usecase/organization.command';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
// import { decodeCollectionQuery } from 'src/libs/collection-query/query-converter';

@Controller('Organizations')
@ApiTags('Organizations')
export class AccountController {
  constructor(
    private commands: AccountCommandService,
    private queries: AccountQueryService,
  ) {}
  @Post('create-account')
  @AllowAnonymous()
  // @AllowLocationInterceptor()
  @ApiOkResponse({ type: AccountResponse })
  async createAccount(@Body() command: CreateOrganizationCommand) {
    return await this.commands.CreateAccounts(command);
  }
  @Post('register-organization-with-etrade')
  @AllowAnonymous()
  @ApiOkResponse({ type: AccountResponse })
  async registerOrganizationWithETrade(
    @Body() command: CheckOrganizationFromETrade,
  ) {
    return await this.commands.registerOrganizationWithETrade(command);
  }
  @Get('get-accounts')
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Collection Query Parameter. Optional',
    required: false,
  })
  @AllowAnonymous()
  @ApiOkResponse({ type: AccountResponse })
  async getAccounts(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.queries.getAccounts(query);
  }
  @Get('get-account/:id')
  @ApiOkResponse({ type: AccountResponse })
  async getAccountByAccountId(@Param('id', ParseUUIDPipe) accountId: string) {
    return await this.queries.getAccountByAccountId(accountId);
  }
  @Get('get-account-byEmail/:email')
  @AllowAnonymous()
  @ApiOkResponse({ type: AccountResponse })
  async getAccountByEmail(@Param('email') email: string) {
    return await this.queries.getAccountByEmail(email);
  }
}

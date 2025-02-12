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
import {
  CreateAccountCommand,
} from '../../dtos/command.dto/account.dto';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { AccountResponse } from '../../dtos/response.dto/account.response.dto';
import { decodeCollectionQuery } from 'src/libs/collection-query/query-converter';

@Controller('accounts')
@ApiTags('Accounts')
export class AccountController {
  constructor(
    private commands: AccountCommandService,
    private queries: AccountQueryService,
  ) {}
  @Get('get-all-accounts')
  @ApiOkResponse({ type: AccountResponse })
  async getAllAcount(@Query('q') q?: string) {
    const query = decodeCollectionQuery(q);
    return await this.queries.getAll(query);
  }

  @Get()
  @ApiQuery({
    name: 'q',
    required: false,
  })
  async getEmployee(@Query('q') q: string) {
    const query = decodeCollectionQuery(q);
    return await this.queries.fetch(query);
  }

  @Get('get-archived-account/:user-id')
  @ApiOkResponse({ type: AccountResponse })
  async getArchivedAccountByUserID(
    @Param('user-id', ParseUUIDPipe) accountuserId: string,
  ) {
    return await this.queries.getArchivedAccountByUserId(accountuserId);
  }
  @Get('get-account/:id')
  @ApiOkResponse({ type: AccountResponse })
  async getAccountByAccountId(@Param('id', ParseUUIDPipe) accountId: string) {
    return await this.queries.getAccountByAccountId(accountId);
  }
  @Get('get-account/:user-name/:user-password')
  @ApiOkResponse({ type: AccountResponse })
  async getAccountsByCredentials(
    @Param('user-name') userName: string,
    @Param('user-password') password: string,
  ) {
    return await this.queries.getUserIdBycredentials(userName, password);
  }

  @Get('get-account-byEmail/:email')
  @AllowAnonymous()
  @ApiOkResponse({ type: AccountResponse })
  async getAccountByEmail(@Param('email') email: string) {
    return await this.queries.getAccountByEmail(email);
  }
  @Post('create-account')
  @AllowAnonymous()
  @ApiOkResponse({ type: AccountResponse })
  async addAccountToUser(@Body() createAccountCommand: CreateAccountCommand) {
    return await this.commands.CreateAccounts(createAccountCommand);
  }
  @Post('create-account-full')
  @AllowAnonymous()
  // @AllowLocationInterceptor()
  @ApiOkResponse({ type: AccountResponse })
  async createAccount(
    @Body() createAccountCommand: CreateAccountCommand,
  ) {
    return await this.commands.CreateAccounts(createAccountCommand);
  }
  // @Post('disable-account/:id')
  // @ApiOkResponse({ type: Boolean })
  // async softDeleteAccount(@Param('id') accountId: string) {
  //   return await this.commands.archiveAccount(accountId);
  // }
  // @Post('restore-account/:id')
  // @ApiOkResponse({ type: Boolean })
  // async restoreAccount(@Param('id') accountId: string) {
  //   return await this.commands.unArchiveAccount(accountId);
  // }
  // @Post('Remove-account/:id')
  // @ApiOkResponse({ type: Boolean })
  // async deleteAccount(@Param('id') accountId: string) {
  //   return await this.commands.deleteAccount(accountId);
  // }

 
  // @Post('activate-account/:accountId')
  // @AllowAnonymous()
  // async activateAccount(@Param('accountId') accountId: string) {
  //   return await this.commands.activateUserAccount(accountId);
  // }
  // @Post('activate-email-phone/:accountId')
  // @AllowAnonymous()
  // async activateAccountEmailPhone(@Param('accountId') accountId: string) {
  //   const result = await this.commands.activateUserAccountEmailPhone(accountId);
  //   return result;
  // }
  // @Post('activate-employee-account')
  // @AllowAnonymous()
  // async activateEmployeeAccount(@Body() command: ActivateEmployeeAccount) {
  //   const result = await this.commands.activateEmployeeAccount(command);
  //   return result;
  // }

  // @Put()
  // async updateOrganizationAccountDetail(@Body() command: UpdateAccountCommand) {
  //   const result = await this.commands.updateAccount(command);
  //   return result;
  // }

 
}

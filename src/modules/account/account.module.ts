/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { AccountController } from './controller/account/account.controller';
import { AccountQueryService } from './service/account-query.service';
import { AccountCommandService } from './service/account-command.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountEntity } from './persistances/account.entity';
import { AuthModule } from '../auth/auth.module';
import { EmployeeEntity } from './persistances/employee.entity';
import { OrganizationEntity } from '../organization/persistencies/organization.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
      EmployeeEntity,
      OrganizationEntity,
    ]),
    forwardRef(() => AuthModule),
  ],
  providers: [AccountQueryService, AccountCommandService],
  controllers: [AccountController],
  exports: [AccountQueryService, AccountCommandService],
})
export class AccountModule {}

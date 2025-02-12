/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Account } from '../../domain/account';
import { AccountEntity } from '../../persistances/account.entity';

export class AccountResponse {
  // @ApiProperty()
  // @IsNotEmpty()
  // @IsUUID()
  id: string;
  @ApiProperty()
  @IsUUID()
  categoryId: string;
  @ApiProperty()
  @IsNotEmpty()
  userName: string;
  @ApiProperty()
  @IsNotEmpty()
  status: string;
  @ApiProperty()
  @IsNotEmpty()
  Password: string;
  @ApiProperty()
  @IsNotEmpty()
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  accountType: string;
  @ApiProperty()
  @IsNotEmpty()
  accountUserType: string;
  @ApiProperty()
  createAt: Date;
  @ApiProperty()
  createdBy: string;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  updatedBy: string;
  @ApiProperty()
  deletedAt: Date;
  @ApiProperty()
  deletedBy: string;

  @ApiProperty()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  organizationName: string;

  @ApiProperty()
  organizationTin: string;

  @ApiProperty()
  category: any;

  static fromEntity(accountEntity: AccountEntity): AccountResponse {
    // console.log('llllllllllllllllllllllllllllll')
    const accountResponse: AccountResponse = new AccountResponse();
    accountResponse.id = accountEntity?.id;
    // accountResponse.userId = accountEntity.userId;
    accountResponse.userName = accountEntity?.userName;
    accountResponse.status = accountEntity?.status;
    accountResponse.Password = accountEntity?.password;
    accountResponse.Password = accountEntity?.password;
    accountResponse.email = accountEntity?.email;
    accountResponse.categoryId = accountEntity?.categoryId;
    // accountResponse.questionnaires = accountEntity?.questionnaires;
    accountResponse.accountType = accountEntity?.accountType;
    accountResponse.accountUserType = accountEntity?.accountUserType;
    // console.log('llllllllllllllllllllllllllllll')
    accountResponse.phone = accountEntity?.phone;

    accountResponse.createAt = accountEntity?.createdAt;
    accountResponse.createdBy = accountEntity?.createdBy;
    accountResponse.updatedAt = accountEntity?.updatedAt;
    accountResponse.updatedBy = accountEntity?.updatedBy;
    accountResponse.deletedAt = accountEntity?.deletedAt;
    accountResponse.deletedBy = accountEntity?.deletedBy;

    accountResponse.organizationTin = accountEntity?.organizationTin;
    accountResponse.organizationName = accountEntity?.organizationName;

    return accountResponse;
  }
  static fromDomain(userAccount: Account): AccountResponse {
    const accountResponse: AccountResponse = new AccountResponse();
    accountResponse.id = userAccount.id;
    // accountResponse.userId = userAccount.userId;
    accountResponse.Password = userAccount.password;
    accountResponse.userName = userAccount.userName;
    accountResponse.status = userAccount.status;
    accountResponse.email = userAccount.email;
    accountResponse.accountType = userAccount.accountType;
    accountResponse.accountUserType = userAccount.accountUserType;
    accountResponse.categoryId = userAccount.categoryId;
    accountResponse.organizationTin = userAccount?.organizationTin;
    accountResponse.organizationName = userAccount?.organizationName;

    accountResponse.createAt = userAccount.createdAt;
    accountResponse.createdBy = userAccount.createdBy;
    accountResponse.updatedAt = userAccount.updatedAt;
    accountResponse.updatedBy = userAccount.updatedBy;
    accountResponse.deletedAt = userAccount.deletedAt;
    accountResponse.deletedBy = userAccount.deletedBy;
    return accountResponse;
  }
}

// /* eslint-disable prettier/prettier */
// import { ApiProperty } from '@nestjs/swagger';
// import { IsNotEmpty, IsUUID } from 'class-validator';
// import { Account } from '../../domain/account';
// import { AccountEntity } from '../../persistances/account.entity';
// import { OrganizationResponse } from 'src/modules/organization/usecase/organization.response';

// export class AccountResponse {
//   @ApiProperty()
//   // @IsNotEmpty()
//   // @IsUUID()
//   id: string;
//   @ApiProperty()
//   @IsNotEmpty()
//   userName: string;
//   @ApiProperty()
//   @IsNotEmpty()
//   status: string;
//   @ApiProperty()
//   @IsNotEmpty()
//   Password: string;
//   @ApiProperty()
//   @IsNotEmpty()
//   email: string;
//   @ApiProperty()
//   createAt: Date;
//   @ApiProperty()
//   createdBy: string;
//   @ApiProperty()
//   updatedAt: Date;
//   @ApiProperty()
//   updatedBy: string;
//   @ApiProperty()
//   deletedAt: Date;
//   @ApiProperty()
//   deletedBy: string;

//   @ApiProperty()
//   @IsNotEmpty()
//   phone: string;

//   @ApiProperty()
//   organization: OrganizationResponse;

//   static fromEntity(accountEntity: AccountEntity): AccountResponse {
//     const accountResponse: AccountResponse = new AccountResponse();
//     accountResponse.id = accountEntity?.id;
//     accountResponse.userName = accountEntity?.userName;
//     accountResponse.status = accountEntity?.status;
//     accountResponse.Password = accountEntity?.password;
//     accountResponse.email = accountEntity?.email;
//     accountResponse.phone = accountEntity?.phone;
//     accountResponse.createAt = accountEntity?.createdAt;
//     accountResponse.createdBy = accountEntity?.createdBy;
//     accountResponse.updatedAt = accountEntity?.updatedAt;
//     accountResponse.updatedBy = accountEntity?.updatedBy;
//     accountResponse.deletedAt = accountEntity?.deletedAt;
//     accountResponse.deletedBy = accountEntity?.deletedBy;
//     if(accountEntity?.organization){
//       accountResponse.organization=OrganizationResponse.toResponse(accountEntity.organization)
//     }
//     return accountResponse;
//   }
//   static fromDomain(userAccount: Account): AccountResponse {
//     const accountResponse: AccountResponse = new AccountResponse();
//     accountResponse.id = userAccount.id;
//     // accountResponse.userId = userAccount.userId;
//     accountResponse.Password = userAccount.password;
//     accountResponse.userName = userAccount.userName;
//     accountResponse.status = userAccount.status;
//     accountResponse.email = userAccount.email;

//     accountResponse.createAt = userAccount.createdAt;
//     accountResponse.createdBy = userAccount.createdBy;
//     accountResponse.updatedAt = userAccount.updatedAt;
//     accountResponse.updatedBy = userAccount.updatedBy;
//     accountResponse.deletedAt = userAccount.deletedAt;
//     accountResponse.deletedBy = userAccount.deletedBy;
//     return accountResponse;
//   }
// }

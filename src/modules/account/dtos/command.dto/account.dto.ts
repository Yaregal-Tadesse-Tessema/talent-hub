// /* eslint-disable prettier/prettier */
// import { ApiProperty } from '@nestjs/swagger';
// import { AccountEntity } from '../../persistances/account.entity';
// import { AccountStatusEnums } from 'src/modules/auth/constants';

// export class CreateAccountCommand {
//   id?: string;
//   @ApiProperty()
//   organizationId: string;
//   @ApiProperty()
//   userName?: string;
//   @ApiProperty({ default: AccountStatusEnums.ACTIVE })
//   status?: AccountStatusEnums;
//   @ApiProperty()
//   phone?: string;
//   @ApiProperty()
//   email?: string;
//   @ApiProperty()
//   password?: string;
//   @ApiProperty()
//   confirmPassword?: string;
//   @ApiProperty()
//   tinNumber: string | null;
//   @ApiProperty()
//   organizationName: string | null;

//   @ApiProperty()
//   createdAt: Date;
//   createdBy?: string;

//   static toEntity(CreateAccountCommand: CreateAccountCommand): AccountEntity {
//     const userAcountEntity: AccountEntity = new AccountEntity();
//     userAcountEntity.id = CreateAccountCommand?.id;
//     // userAcountEntity.userId = CreateAccountCommand.userID
//     userAcountEntity.userName = CreateAccountCommand.phone
//       ? CreateAccountCommand.phone
//       : CreateAccountCommand.email;
//     userAcountEntity.email = CreateAccountCommand.email;
//     userAcountEntity.status = CreateAccountCommand.status;
//     userAcountEntity.phone = CreateAccountCommand.phone;

//     userAcountEntity.password = CreateAccountCommand.password;

//     userAcountEntity.createdAt = CreateAccountCommand.createdAt;
//     userAcountEntity.createdBy = CreateAccountCommand.createdBy;
//     return userAcountEntity;
//   }
// }

// export class UpdateAccountCommand extends CreateAccountCommand {
//   @ApiProperty()
//   id: string;
// }

// export class CheckOrganizationFromETrade {
//   @ApiProperty()
//   tin: string;
//   @ApiProperty()
//   licenseNumber: string;
// }
// export class PasswordReset {
//   @ApiProperty()
//   email?: string;
//   @ApiProperty()
//   phone?: string;
// }
// export class EmailPhoneResetCommand {
//   @ApiProperty()
//   accountId: string;
//   @ApiProperty()
//   email?: string;
//   @ApiProperty()
//   phone?: string;
// }

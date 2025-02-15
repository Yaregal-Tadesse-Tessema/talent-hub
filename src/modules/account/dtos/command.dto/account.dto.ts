/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { AccountEntity } from '../../persistances/account.entity';
import { AccountStatusEnums } from 'src/modules/auth/constants';


export class CreateAccountCommand {
  id?: string;
  userID?: string;
  vitalId?: string;
  dateOfBirth?: Date;
  @ApiProperty()
  categoryId: string;
  @ApiProperty()
  userName?: string;
  @ApiProperty({default:AccountStatusEnums.ACTIVE})
  status?: AccountStatusEnums;
  @ApiProperty()
  middleName?: string;
  @ApiProperty()
  lastName?: string;
  @ApiProperty()
  firstName?: string;
  @ApiProperty()
  phone?: string;
  @ApiProperty()
  Password?: string;
  @ApiProperty()
  confirmPassword?: string;
  @ApiProperty()
  email?: string;
  @ApiProperty({ required: false })
  accountUserType: string;
  accountType?: string;

  @ApiProperty()
  clusterId?: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  organizationTin: string | null;

  @ApiProperty()
  organizationName: string | null;


  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  subCityId: string | null;

  @ApiProperty()
  woredaId: string | null;

  @ApiProperty()
  cityId: string | null;

  @ApiProperty({ required: false })
  serviceDepartmentId: string;

  @ApiProperty({ required: false })
  serviceCategoryId: string;

  @ApiProperty({ required: false })
  organizationTypeId: string;

  @ApiProperty({ required: false })
  institutionTypeId: string;

  @ApiProperty({ required: false })
  employmentPositionId: string;
  registerBy: string;

  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt: Date;
  deletedBy: string;
  // static fromCommands(CreateAccountCommand: CreateAccountCommand): UserAcount {
  //   const userAcount: UserAcount = new UserAcount();
  //   userAcount.id = CreateAccountCommand.id;
  //   // userAcount.userId = CreateAccountCommand.userID
  //   userAcount.userName =
  //     CreateAccountCommand?.userName == null
  //       ? CreateAccountCommand.email
  //       : CreateAccountCommand?.userName;
  //   userAcount.email = CreateAccountCommand?.email;
  //   userAcount.phone = CreateAccountCommand?.phone;
  //   userAcount.status = CreateAccountCommand?.status;
  //   userAcount.accountType = CreateAccountCommand?.accountType;
  //   userAcount.accountUserType = CreateAccountCommand?.accountUserType;
  //   userAcount.category = CreateAccountCommand?.category;

  //   userAcount.password = CreateAccountCommand.Password;
  //   userAcount.createdAt = CreateAccountCommand.createdAt;
  //   userAcount.createdBy = CreateAccountCommand.createdBy;
  //   userAcount.updatedAt = CreateAccountCommand.updatedAt;
  //   userAcount.updatedBy = CreateAccountCommand.updatedBy;
  //   userAcount.deletedAt = CreateAccountCommand.deletedAt;
  //   userAcount.deletedBy = CreateAccountCommand.deletedBy;
  //   return userAcount;
  // }
  static toEntity(CreateAccountCommand: CreateAccountCommand): AccountEntity {
    const userAcountEntity: AccountEntity = new AccountEntity();
    userAcountEntity.id = CreateAccountCommand?.id;
    // userAcountEntity.userId = CreateAccountCommand.userID
    userAcountEntity.userName = CreateAccountCommand.phone
      ? CreateAccountCommand.phone
      : CreateAccountCommand.email;
    userAcountEntity.email = CreateAccountCommand.email;
    userAcountEntity.status = CreateAccountCommand.status;
    userAcountEntity.phone = CreateAccountCommand.phone;
    userAcountEntity.password = CreateAccountCommand.Password;
    userAcountEntity.createdAt = CreateAccountCommand.createdAt;
    userAcountEntity.createdBy = CreateAccountCommand.createdBy;
    userAcountEntity.updatedAt = CreateAccountCommand.updatedAt;
    userAcountEntity.updatedBy = CreateAccountCommand.updatedBy;
    userAcountEntity.deletedAt = CreateAccountCommand.deletedAt;
    userAcountEntity.deletedBy = CreateAccountCommand.deletedBy;


    return userAcountEntity;
  }

  //   static fromDomain(userAcount: userAcount): ApplicationResponse {
  //     const applicationResponse: ApplicationResponse = new ApplicationResponse();
  //     applicationResponse.id = licenseApplication.id;
  //     applicationResponse.id = licenseApplication.id
  //     applicationResponse.status = licenseApplication.status
  //     applicationResponse.type = licenseApplication.type

  //     applicationResponse.createdAt=licenseApplication.createdAt
  //     applicationResponse.createdBy=licenseApplication.createdBy
  //     applicationResponse.updatedAt=licenseApplication.updatedAt
  //     applicationResponse.updatedBy=licenseApplication.updatedBy
  //     applicationResponse.deletedAt=licenseApplication.deletedAt
  //     applicationResponse.deletedBy=licenseApplication.deletedBy
  //     return applicationResponse;
  //   }
}

export class UpdateAccountCommand {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  categoryId: string;
  @ApiProperty()
  userName: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  accountType: string;
  @ApiProperty()
  accountUserType: string;
  @ApiProperty()
  Password: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  organizationName: string;
  @ApiProperty()
  organizationTin: string;
  @ApiProperty()
  createdAt: Date;
  // @ApiProperty()
  createdBy: string;
  // @ApiProperty()
  updatedAt: Date;
  // @ApiProperty()
  updatedBy: string;
  // @ApiProperty()
  deletedAt: Date;
  // @ApiProperty()
  deletedBy: string;
  // static fromCommands(CreateAccountCommand: UpdateAccountCommand): UserAcount {
  //   const userAcount: UserAcount = new UserAcount();
  //   userAcount.id = CreateAccountCommand.id;
  //   // userAcount.userId = CreateAccountCommand.userId
  //   userAcount.userName = CreateAccountCommand.userName;
  //   userAcount.phone = CreateAccountCommand.phone;
  //   userAcount.status = CreateAccountCommand.status;
  //   userAcount.password = CreateAccountCommand.Password;
  //   userAcount.email = CreateAccountCommand.email;
  //   userAcount.accountType = CreateAccountCommand.accountType;
  //   userAcount.accountUserType = CreateAccountCommand.accountUserType;
  //   userAcount.questionnaires = UpdateSecurityQuestionnairesCommand?.toEntities(
  //     CreateAccountCommand?.questionnaires,
  //   );
  //   userAcount.createdAt = CreateAccountCommand.createdAt;
  //   userAcount.createdBy = CreateAccountCommand.createdBy;
  //   userAcount.updatedAt = CreateAccountCommand.updatedAt;
  //   userAcount.updatedBy = CreateAccountCommand.updatedBy;
  //   userAcount.deletedAt = CreateAccountCommand.deletedAt;
  //   userAcount.deletedBy = CreateAccountCommand.deletedBy;
  //   return userAcount;
  // }
}

export class addQuestionnairesToAccountCommand {
  @ApiProperty()
  id: string;

  // static fromCommands(
  //   CreateAccountCommand: addQuestionnairesToAccountCommand,
  // ): UserAcount {
  //   const userAcount: UserAcount = new UserAcount();
  //   userAcount.id = CreateAccountCommand.id;
  //   userAcount.questionnaires = UpdateSecurityQuestionnairesCommand?.toEntities(
  //     CreateAccountCommand?.questionnaires,
  //   );

  //   return userAcount;
  // }
}

/**
 * Questionnaires={question:"",answer:""}
 */
export class CheckSecurityQuestions {
  @ApiProperty()
  questionID: string;
  @ApiProperty()
  answer: string;
}

export class PasswordReset {
  @ApiProperty()
  email?: string;
  @ApiProperty()
  phone?: string;
}
export class EmailPhoneResetCommand {
  @ApiProperty()
  accountId: string;
  @ApiProperty()
  email?: string;
  @ApiProperty()
  phone?: string;
}
export class CheckCode extends PasswordReset {
  @ApiProperty()
  code: number;
}

export class ResetPassword extends PasswordReset {
  @ApiProperty()
  code?: number;
  @ApiProperty()
  newPassword: string;
  @ApiProperty()
  confirmNewPassword?: string;
}

export class ChangePassword {
  @ApiProperty()
  email: string;
  @ApiProperty()
  oldPassword: string;
  @ApiProperty()
  newPassword: string;
  @ApiProperty()
  confirmNewPassword: string;
}

export class ResetPasswordByQuestionnaires {
  @ApiProperty()
  accountId?: string;
  @ApiProperty()
  email?: string;
  @ApiProperty()
  phone?: string;
  @ApiProperty()
  newPassword: string;
  @ApiProperty()
  confirmNewPassword?: string;
}

export class ActivateEmployeeAccount {
  @ApiProperty()
  accountId: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  confirmPassword: string;
}

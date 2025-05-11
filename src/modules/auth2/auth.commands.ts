/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import { UserInfo } from 'src/libs/Common/user-information';

export class UserLoginCommand {
  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string;
  @ApiProperty()
  email?: string;
  @ApiProperty()
  userName?: string;
  @ApiProperty()
  orgCode: string;
  @IsNotEmpty()
  appId: string;
  @ApiProperty()
  @IsNotEmpty()
  password: string;
  fcmId?: string;
}
export class ChangePasswordCommand {
  @ApiProperty()
  @IsNotEmpty()
  currentPassword: string;
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(64)
  //@Matches(RegExp('^[a-zA-Z0-9\\-]+$'))
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S+$/, {
  //   message:
  //     'password too weak, It must be combination of Uppercase, lowercase, special character and numbers',
  // })
  password: string;
  @ApiProperty()
  @IsNotEmpty()
  
  confirmPassword: string;
  @ApiProperty()
  employeeId?: string;
  currentUser: UserInfo;
}
export class ChangeOtherPasswordCommand {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(64)
  password: string;
  @ApiProperty()
  @IsNotEmpty()
  
  confirmPassword: string;
  @ApiProperty()
  employeeId?: string;
  @ApiProperty()
  phoneNumber?: string;
  currentUser: UserInfo;
}
export class ForgotPasswordCommand {
  @ApiProperty()
  @IsNotEmpty()
  email: string;
}
export class UpdatePasswordCommand {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(64)
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S+$/, {
  //   message:
  //     'password too weak, It must be combination of Uppercase, lowercase, special character and numbers',
  // })
  password: string;
  @ApiProperty()
  @IsNotEmpty()
  
  confirmPassword: string;
  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string;
}
export class ResetPasswordCommand {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S+$/, {
    message:
      'password too weak, It must be combination of Uppercase, lowercase, special character and numbers',
  })
  password: string;
  @ApiProperty()
  @IsNotEmpty()

  confirmPassword: string;
  @ApiProperty()
  @IsNotEmpty()
  token: string;
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}
export enum OrganizationType {
  PORTAL = "portal",
  BACKOFFICE = "backOffice"
}
export class SwitchOrganizationCommand {
  @ApiProperty()
  @IsNotEmpty()
  orgCode: string;
  @ApiProperty()
  @IsNotEmpty()
  appId: OrganizationType;
}

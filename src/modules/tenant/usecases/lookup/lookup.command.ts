/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { LookupEntity } from '../../persistencies/lookup.entity';
import { UserType } from '../../constants';
import { Util } from 'src/libs/Common/util';

export class CreateLookupCommand {
  @ApiProperty()
  userId?: string;
  id?: string;
  @ApiProperty()
  firstName?: string;
  @ApiProperty()
  middleName?: string;
  @ApiProperty()
  lastName?: string;
  @ApiProperty()
  @IsNotEmpty()
  password: string;
  @ApiProperty()
  @IsNotEmpty()
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string;
  @ApiProperty()
  status: AccountStatusEnums;
  @ApiProperty()
  userType: UserType;
  currentUser?: any;

  @ApiProperty()
  jobTitle?: string;
  @ApiProperty()
  startDate?: Date;
  @ApiProperty()
  @IsNotEmpty()
  tenantId?: string;
  @ApiProperty()
  tenantName?: string;
  static fromCommand(command: CreateLookupCommand): LookupEntity {
    const lookUp = new LookupEntity();
    lookUp.id = command?.id;
    lookUp.userId = command?.userId;
    lookUp.fullName = `${command?.firstName} ${command?.middleName} ${command?.lastName}`;
    lookUp.firstName = command.firstName;
    lookUp.middleName = command.middleName;
    lookUp.lastName = command.lastName;
    const password = Util.hashPassword(command.password??'C0mplex!');
    lookUp.password = password;
    lookUp.email = command.email;
    lookUp.phoneNumber = command.phoneNumber;
    lookUp.status = command?.status;
    lookUp.userType = command?.userType;
    lookUp.createdBy = command?.currentUser?.id;
    lookUp.updatedBy = command?.currentUser?.id;
    return lookUp;
  }
}

export class UpdateLookupCommand extends CreateLookupCommand {
  @ApiProperty({
    example: 'uuid',
  })
  @IsNotEmpty()
  id: string;
}


export class ArchiveLookUpCommand {
  @ApiProperty({
    example: 'uuid',
  })
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  reason: string;

  currentUser: any;
}
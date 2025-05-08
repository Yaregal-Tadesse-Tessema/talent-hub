/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { LookupEntity } from '../../persistencies/lookup.entity';

export class CreateLookupCommand {
  id?: string;
  @ApiProperty()
  firstName?: string;
  @ApiProperty()
  middleName?: string;
  @ApiProperty()
  lastName?: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  status: AccountStatusEnums;
  currentUser?: any;

  @ApiProperty()
  jobTitle?: string;
  @ApiProperty()
  startDate?: Date;
  @ApiProperty()
  tenantId?: string;
  @ApiProperty()
  tenantName?: string;
  static fromCommand(command: CreateLookupCommand): LookupEntity {
    const lookUp = new LookupEntity();
    lookUp.id = command?.id;
    lookUp.fullName = `${command?.firstName} ${command?.middleName} ${command?.lastName}`;
    lookUp.firstName = command.firstName;
    lookUp.middleName = command.middleName;
    lookUp.lastName = command.lastName;
    lookUp.password = command.password;
    lookUp.email = command.email;
    lookUp.phoneNumber = command.phoneNumber;
    lookUp.status = command?.status;
    lookUp.createdBy = command.currentUser.id;
    lookUp.updatedBy = command.currentUser.id;
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
/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserStatusEnums } from '../constants';
import { LookUpEntity } from '../persistances/lookup.entity';

export class CreateLookupCommand {
  id?: string;
  @ApiProperty()
  employeeId: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  middleName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  tin: string;
  @ApiProperty()
  jobTitle: string;
  @ApiProperty()
  password?: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  phoneNumber?: string;
  @ApiProperty()
  status: UserStatusEnums;
  currentUser?: any;

  static fromCommand(command: CreateLookupCommand): LookUpEntity {
    const lookUp = new LookUpEntity();
    lookUp.id = command?.id;
    lookUp.employeeId = command.employeeId;
    lookUp.fullName = `${command?.firstName} ${command?.middleName} ${command?.lastName}`;
    lookUp.firstName = command.firstName;
    lookUp.middleName = command.middleName;
    lookUp.lastName = command.lastName;
    lookUp.tin = command.tin;
    lookUp.jobTitle = command.jobTitle;
    lookUp.password = command.password;
    lookUp.email = command.email;
    lookUp.phoneNumber = command.phoneNumber;
    lookUp.status = command?.status;
    lookUp.createdBy = command.currentUser.id;
    lookUp.updatedBy = command.currentUser.id;
    return lookUp;
  }
}

export class UpdateLookUpCommand extends CreateLookupCommand {
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

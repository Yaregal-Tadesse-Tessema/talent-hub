import { ApiProperty } from '@nestjs/swagger';
import { UserInfo } from '@libs/common/user-info';
import { IsNotEmpty } from 'class-validator';

import { LookUpEntity } from 'modules/tenant-database/persistance/look-up-table.entity';
import { EmployeeStatus } from '@libs/common/enums';
import { DataSource } from 'typeorm';

export class CreateLookUpCommand {
  id?: string;
  @ApiProperty()
  // @IsNotEmpty()
  employeeId: string;

  @ApiProperty()
  fullName: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  middleName: string;
  @ApiProperty()
  lastName: string;
 

  @ApiProperty()
  email: string;

  @ApiProperty()
  tenantId: number;
  @ApiProperty()
  tin: string;
  @ApiProperty()
  jobTitle: string;
  // @ApiProperty()
  // organizationSchemaName: string;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  hasBackOfficeAccess: boolean;

  @ApiProperty()
  status: EmployeeStatus;
  @ApiProperty()
  password?: string;
  @ApiProperty()
  accessToken?: string;
  @ApiProperty()
  refreshToken?: string;
  currentUser?: UserInfo;
  connection?: DataSource;

  static fromCommand(command: CreateLookUpCommand): LookUpEntity {
    const lookUp = new LookUpEntity();
    lookUp.id = command?.id;
    lookUp.employeeId = command.employeeId;
    lookUp.fullName = `${command?.firstName} ${command?.middleName} ${command?.lastName}`;
    lookUp.firstName = command.firstName;
    lookUp.middleName = command.middleName;
    lookUp.lastName = command.lastName;
    lookUp.password = command.password;
    lookUp.email = command.email;
    lookUp.tin = command.tin;
    lookUp.jobTitle = command.jobTitle;
    lookUp.accessToken = command.accessToken;
    // lookUp.organizationSchemaName = command.organizationSchemaName;
    lookUp.phoneNumber = command?.phoneNumber;
    lookUp.hasBackOfficeAccess = command?.hasBackOfficeAccess;
    lookUp.refreshToken = command.refreshToken;
    lookUp.status = command.status;
    lookUp.createdBy = command.currentUser.id;
    lookUp.updatedBy = command.currentUser.id;
    return lookUp;
  }
}

export class UpdateLookUpCommand extends CreateLookUpCommand {
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

  currentUser: UserInfo;
}

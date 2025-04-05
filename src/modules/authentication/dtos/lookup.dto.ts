/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserStatusEnums } from '../constants';
import { LookupEntity } from '../persistances/lookup.entity';

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
  status: UserStatusEnums;
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
export class LookupResponse {
  @ApiProperty({
    example: 'uuid',
  })
  @IsNotEmpty()
  id: string;

  static toResponse(entity: LookupEntity): LookupResponse {
    const response = new LookupEntity();
    response.id = entity?.id;
    response.fullName = `${entity?.firstName} ${entity?.middleName} ${entity?.lastName}`;
    response.firstName = entity.firstName;
    response.middleName = entity.middleName;
    response.lastName = entity.lastName;
    response.email = entity.email;
    response.phoneNumber = entity.phoneNumber;
    response.status = entity?.status;
    response.createdBy = entity.createdBy;
    response.updatedBy = entity.updatedBy;
    return response;
  }
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

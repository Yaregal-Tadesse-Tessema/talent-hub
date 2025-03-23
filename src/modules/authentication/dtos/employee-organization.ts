/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { EmployeeOrganizationEntity } from '../persistances/employee-organization.entity';
export class CreateEmployeeOrganizationCommand {
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  tenantId: number;
  @ApiProperty()
  employeeId: string;
  @ApiProperty()
  lookupId: string;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  status: string;

  currentUser?: any;

  static fromCommand(
    command: CreateEmployeeOrganizationCommand,
  ): EmployeeOrganizationEntity {
    const entity = new EmployeeOrganizationEntity();
    entity.id = command?.id;
    entity.tenantId = command.tenantId;
    entity.employeeId = command.employeeId;
    entity.lookupId = command.lookupId;
    entity.startDate = command.startDate;
    entity.status = command.status;
    return entity;
  }
}
export class UpdateEmployeeOrganizationCommand extends CreateEmployeeOrganizationCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}

export class ArchiveEmployeeOrganizationCommand {
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

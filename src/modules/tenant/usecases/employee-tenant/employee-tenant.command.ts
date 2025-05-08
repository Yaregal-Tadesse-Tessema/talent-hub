/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { EmployeeTenantEntity } from '../../persistencies/employee-tenant.entity';
export class CreateEmployeeTenantCommand {
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
  tenantId: string;
  @ApiProperty()
  lookupId: string;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  status: string;
  @ApiProperty()
  jobTitle: string;
  @ApiProperty()
  tenantName: string;
  currentUser?: any;

  static fromCommand(
    command: CreateEmployeeTenantCommand,
  ): EmployeeTenantEntity {
    const entity = new EmployeeTenantEntity();
    entity.id = command?.id;
    entity.tenantId = command.tenantId;
    entity.lookupId = command.lookupId;
    entity.startDate = command.startDate;
    entity.status = command.status;
    entity.jobTitle = command.jobTitle;
    entity.tenantName = command.tenantName;
    return entity;
  }
}
export class UpdateEmployeeTenantCommand extends CreateEmployeeTenantCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}

export class ArchiveEmployeeTenantCommand {
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
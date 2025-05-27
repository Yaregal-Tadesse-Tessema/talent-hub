/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserTenantEntity } from '../../persistencies/user-tenant.entity';
export class CreateUserTenantCommand {
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
  tenantId: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  remark: string;
  currentUser?: any;
  static fromCommand(
    command: CreateUserTenantCommand,
  ): UserTenantEntity {
    const entity = new UserTenantEntity();
    entity.id = command?.id;
    entity.tenantId = command.tenantId;
    entity.userId = command.userId;
    entity.remark = command.remark;
    return entity;
  }
}
export class UpdateUserTenantCommand extends CreateUserTenantCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}
export class ArchiveUserTenantCommand {
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
/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { TenantEntity } from '../../persistencies/tenant.entity';
import { TEnantSubscriptionTypes } from '../../constants';
export class CreateTenantCommand {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  prefix?: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  schemaName?: string;
  @ApiProperty()
  type?: string;
  @ApiProperty()
  tradeName?: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  code?: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  address?: any;
  @ApiProperty()
  subscriptionType?: TEnantSubscriptionTypes;
  @ApiProperty()
  isVerified?: boolean;
  @ApiProperty()
  tin: string;
  @ApiProperty()
  licenseNumber?: string;
  @ApiProperty()
  registrationNumber?: string;
  @ApiProperty()
  isActive?: boolean;
  @ApiProperty()
  status?: AccountStatusEnums;
  @ApiProperty()
  logo?: FileDto;
  @ApiProperty()
  companySize?: string;
  @ApiProperty()
  industry?: string;
  @ApiProperty()
  organizationType?: string;
  @ApiProperty()
  selectedCalender?: string;
  @ApiProperty()
  archiveReason?: string;
  currentUser?: any;

  static fromCommand(command: CreateTenantCommand): TenantEntity {
    const tenant = new TenantEntity();
    tenant.id = command?.id;
    tenant.prefix = command.prefix;
    tenant.name = command.name;
    tenant.schemaName = command.schemaName;
    tenant.type = command.type;
    tenant.tradeName = command.tradeName;
    tenant.email = command.email;
    tenant.code = command.code;
    tenant.phoneNumber = command.phoneNumber;
    tenant.address = command.address;
    tenant.subscriptionType = command?.subscriptionType;
    tenant.isVerified = command.isVerified;
    tenant.tin = command.tin;
    tenant.tin = command.tin;
    tenant.licenseNumber = command.licenseNumber;
    tenant.registrationNumber = command.registrationNumber;
    tenant.status = command?.status;
    tenant.logo = command.logo;
    tenant.companySize = command.companySize;
    tenant.industry = command.industry;
    tenant.organizationType = command.organizationType;
    tenant.selectedCalender = command.selectedCalender;
    return tenant;
  }
}
export class UpdateTenantCommand extends CreateTenantCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}

export class ArchiveTenantCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  reason: string;

  currentUser: any;
}
export class AddWifiLocation {
  @ApiProperty()
  @IsNotEmpty()
  wifiInfo: any;

  @ApiProperty()
  @IsNotEmpty()
  reason: string;

  currentUser: any;
}
export class CheckOrganizationFromETrade {
  @ApiProperty()
  tin: string;
  @ApiProperty()
  licenseNumber: string;
}
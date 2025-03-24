/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { CalenderTypeEnums, OrganizationStatusEnums } from '../constants';
import { TenantEntity } from '../persistances/tenant.entity';
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
  subscriptionType?: string;
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
  status?: OrganizationStatusEnums;
  @ApiProperty()
  logo?: FileDto;
  @ApiProperty()
  companySize?: string;
  @ApiProperty()
  industry?: string;
  @ApiProperty()
  organizationType?: string;
  @ApiProperty()
  selectedCalender?: CalenderTypeEnums;
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
export class TenantResponse extends CreateTenantCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  static toResponse(entity: TenantEntity): TenantResponse {
    const response = new TenantResponse();
    response.id = entity?.id;
    response.prefix = entity.prefix;
    response.name = entity.name;
    response.schemaName = entity.schemaName;
    response.type = entity.type;
    response.tradeName = entity.tradeName;
    response.email = entity.email;
    response.code = entity.code;
    response.phoneNumber = entity.phoneNumber;
    response.address = entity.address;
    response.subscriptionType = entity?.subscriptionType;
    response.isVerified = entity.isVerified;
    response.tin = entity.tin;
    response.licenseNumber = entity.licenseNumber;
    response.registrationNumber = entity.registrationNumber;
    response.isActive = entity.isActive;
    response.status = entity?.status;
    response.logo = entity.logo;
    response.companySize = entity.companySize;
    response.industry = entity.industry;
    response.organizationType = entity.organizationType;
    response.selectedCalender = entity.selectedCalender;
    return response;
  }
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
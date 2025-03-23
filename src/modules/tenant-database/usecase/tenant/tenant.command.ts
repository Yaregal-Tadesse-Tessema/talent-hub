import { ApiProperty } from '@nestjs/swagger';
import { UserInfo } from '@libs/common/user-info';
import { IsNotEmpty } from 'class-validator';

import { EmployeeStatus } from '@libs/common/enums';
import { TenantEntity } from 'modules/tenant-database/persistance/tenat.entity';
import { Address } from '@libs/common/address';
import { FileDto } from '@libs/common/file-dto';
import { OrganizationStatusEnums } from '../orgaization-status-enums';
import { CALENDERTYPEENUMS } from 'modules/tenant-database/constants';

export class CreateTenantCommand {
  id: number;
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  tradeName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  address: Address;

  @ApiProperty()
  subscriptionType: EmployeeStatus;
  @ApiProperty()
  isVerified: boolean;
  @ApiProperty()
  tin: string;
  @ApiProperty()
  selectedCalender: CALENDERTYPEENUMS;
  @ApiProperty()
  isActive: boolean;
  @ApiProperty()
  hasSalaryLoan: boolean;
  @ApiProperty()
  hasCreditPurchase: boolean;
  @ApiProperty()
  allowsNegativeLeave?: boolean;
  @ApiProperty()
  allowedNegativeLeaveAmount?: number;
  @ApiProperty()
  status?: OrganizationStatusEnums;
  @ApiProperty()
  logo?: FileDto;
  @ApiProperty()
  ceoId?: string;
  @ApiProperty()
  ceoName?: string;
  @ApiProperty()
  companySize?: string;
  @ApiProperty()
  industry?: string;
  @ApiProperty()
  organizationType?: string;
  @ApiProperty()
  workHour?: string;
  @ApiProperty()
  configuration?: any;
  @ApiProperty()
  wifiInfo?: any;
  @ApiProperty()
  monthlyWorkHour?: number;
  @ApiProperty()
  location?: any;
  currentUser?: UserInfo;

  static fromCommand(command: CreateTenantCommand): TenantEntity {
    const tenant = new TenantEntity();
    tenant.id = command?.id;
    tenant.name = command.name;
    tenant.type = command.type;
    tenant.tradeName = command.tradeName;
    tenant.email = command.email;
    tenant.code = command.code;
    tenant.phoneNumber = command.phoneNumber;
    tenant.address = command.address;
    tenant.subscriptionType = command?.subscriptionType;
    tenant.isVerified = command.isVerified;
    tenant.tin = command.tin;
    tenant.selectedCalender = command?.selectedCalender;
    tenant.isActive = command.isActive;
    tenant.hasSalaryLoan = command.hasSalaryLoan;
    tenant.hasCreditPurchase = command.hasCreditPurchase;
    tenant.allowsNegativeLeave = command.allowsNegativeLeave;
    tenant.configuration = command.configuration;
    tenant.allowedNegativeLeaveAmount = command.allowedNegativeLeaveAmount;
    tenant.status = command.status;
    tenant.logo = command.logo;
    tenant.ceoId = command?.ceoId;
    tenant.ceoName = command?.ceoName;
    tenant.companySize = command.companySize;
    tenant.industry = command.industry;
    tenant.organizationType = command.organizationType;
    tenant.workHour = command.workHour;
    tenant.wifiInfo = command?.wifiInfo;
    tenant.location = command?.location;
    tenant.monthlyWorkHour = command?.monthlyWorkHour;
    return tenant;
  }
}
export class UpdateTenantCommand extends CreateTenantCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: number;
}

export class ArchiveTenantCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  reason: string;

  currentUser: UserInfo;
}
export class AddWifiLocation {
  @ApiProperty()
  @IsNotEmpty()
  wifiInfo: any;

  @ApiProperty()
  @IsNotEmpty()
  reason: string;

  currentUser: UserInfo;
}
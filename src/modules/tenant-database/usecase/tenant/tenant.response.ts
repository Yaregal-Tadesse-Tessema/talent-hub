import { ApiProperty } from '@nestjs/swagger';
import { UserInfo } from '@libs/common/user-info';
import { Address } from '@libs/common/address';
import { FileDto } from '@libs/common/file-dto';
import { TenantEntity } from 'modules/tenant-database/persistance/tenat.entity';
import { EmployeeOrganizationsResponse } from '../employees-Organization/organization-employees.response';

export class TenantResponse {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  schemaName: string;

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
  subscriptionType: string;
  @ApiProperty()
  isVerified: boolean;
  @ApiProperty()
  tin: string;
  @ApiProperty()
  selectedCalender: string;
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
  status: string;
  @ApiProperty()
  logo: FileDto;
  @ApiProperty()
  ceoId: string;
  @ApiProperty()
  ceoName: string;
  @ApiProperty()
  companySize: string;
  @ApiProperty()
  industry: string;
  @ApiProperty()
  organizationType: string;
  @ApiProperty()
  workHour: string;
  @ApiProperty()
  configuration: any;
  @ApiProperty()
  wifiInfo?: any;
  @ApiProperty()
  monthlyWorkHour: number;
  @ApiProperty()
  location?: any;
  organizationEmployees: EmployeeOrganizationsResponse[];

  currentUser?: UserInfo;
  static toResponse(entity: TenantEntity): TenantResponse {
    const response = new TenantResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.schemaName = entity.schemaName;
    response.type = entity.type;
    response.tradeName = entity.tradeName;
    response.email = entity.email;
    response.code = entity.code;
    response.phoneNumber = entity.phoneNumber;
    response.address = entity.address;
    response.subscriptionType = entity.subscriptionType;
    response.isVerified = entity.isVerified;
    response.tin = entity.tin;
    response.selectedCalender = entity.selectedCalender;
    response.isActive = entity.isActive;
    response.hasSalaryLoan = entity.hasSalaryLoan;
    response.hasCreditPurchase = entity.hasCreditPurchase;
    response.allowsNegativeLeave = entity.allowsNegativeLeave;
    response.allowedNegativeLeaveAmount = entity.allowedNegativeLeaveAmount;
    response.status = entity.status;
    response.logo = entity.logo;
    response.ceoId = entity.ceoId;
    response.ceoName = entity.ceoName;
    response.companySize = entity.companySize;
    response.industry = entity.industry;
    response.organizationType = entity.organizationType;
    response.workHour = entity.workHour;
    response.configuration = entity.configuration;
    response.wifiInfo = entity.wifiInfo;
    response.monthlyWorkHour = entity.monthlyWorkHour;
    response.location = entity.location;
    if (entity.organizationEmployees) {
      response.organizationEmployees = entity.organizationEmployees.map(
        (item) => EmployeeOrganizationsResponse.toResponse(item),
      );
    }
    return response;
  }
}

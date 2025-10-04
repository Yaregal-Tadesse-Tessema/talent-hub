/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { TenantEntity } from '../../persistencies/tenant.entity';
import { CreateTenantCommand } from './tenant.command';
import { EmployeeTenantResponse } from '../employee-tenant/employee-tenant.response';
import { UserTenantResponse } from '../user-enant/user-tenant.response';
import { PaymentResponse } from 'src/modules/payment/dto/payment.response';
import { JobPostingResponse } from 'src/modules/job-posting/job/usecase/job-posting.response';

export class TenantResponse extends CreateTenantCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  organizationEmployees:EmployeeTenantResponse[];
  @ApiProperty()
  tenantUsers:UserTenantResponse[];
  @ApiProperty({ type: () => [PaymentResponse] })
  payments:PaymentResponse[];
  @ApiProperty({ type: () => [JobPostingResponse] })
  jobPostings:JobPostingResponse[];
  static toResponse(entity: TenantEntity): TenantResponse {
    const response = new TenantResponse();
    response.id = entity?.id;
    response.prefix = entity.prefix;
    response.name = entity.name;
    response.schemaName = entity.schemaName;
    response.type = entity.type;
    response.tradeName = entity.tradeName;
    response.email = entity.email;
    response.haAiActivated = entity.haAiActivated;
    response.code = entity.code;
    response.phoneNumber = entity.phoneNumber;
    response.address = entity.address;
    response.subscriptionType = entity?.subscriptionType;
    response.isVerified = entity.isVerified;
    response.tin = entity.tin;
    response.tags = entity.tags;
    response.licenseNumber = entity.licenseNumber;
    response.registrationNumber = entity.registrationNumber;
    response.isActive = entity.isActive;
    response.status = entity?.status;
    response.logo = entity.logo;
    response.cover = entity.cover;
    response.companySize = entity.companySize;
    response.industry = entity.industry;
    response.organizationType = entity.organizationType;
    response.selectedCalender = entity.selectedCalender;
    response.isProfilePublic = entity.isProfilePublic;
    response.links = entity.links;

    if (entity?.organizationEmployees?.length > 0) {
      response.organizationEmployees = entity.organizationEmployees.map(EmployeeTenantResponse.toResponse);
    }
    if (entity?.tenantUsers?.length > 0) {
      response.tenantUsers = entity.tenantUsers.map(UserTenantResponse.toResponse);
    }
    if (entity?.payments?.length > 0) {
      response.payments = entity.payments.map(PaymentResponse.toResponse);
    }
    if (entity?.jobPostings?.length > 0) {
      response.jobPostings = entity.jobPostings.map(JobPostingResponse.toResponse);
    }
    return response;
  }
  static toEntity(entity: TenantResponse): TenantEntity {
    const response = new TenantEntity();
    response.id = entity.id;
    response.name = entity.name;
    response.schemaName = entity.schemaName;
    response.type = entity.type;
    response.tradeName = entity.tradeName;
    response.email = entity.email;
    response.haAiActivated = entity.haAiActivated;
    response.code = entity.code;
    response.phoneNumber = entity.phoneNumber;
    response.address = entity.address;
    response.subscriptionType = entity.subscriptionType;
    response.isVerified = entity.isVerified;
    response.tin = entity.tin;
    response.tags = entity.tags;
    response.licenseNumber = entity.licenseNumber;
    response.registrationNumber = entity.registrationNumber;
    response.isActive = entity.isActive;
    response.status = entity.status;
    response.logo = entity.logo;
    response.cover = entity.cover;
    response.companySize = entity.companySize;
    response.industry = entity.industry;
    response.organizationType = entity.organizationType;
    response.selectedCalender = entity.selectedCalender;
    response.isProfilePublic = entity.isProfilePublic;
    response.links = entity.links;
    response.salesInformation = entity.salesInformation;
    response.isAdminCreated = entity.isAdminCreated;
    return response;
  }
}

/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { TenantEntity } from '../../persistencies/tenant.entity';
import { CreateTenantCommand } from './tenant.command';

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
    return response;
  }
}

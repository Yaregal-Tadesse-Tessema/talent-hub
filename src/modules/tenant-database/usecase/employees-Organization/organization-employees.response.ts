import { ApiProperty } from '@nestjs/swagger';
import { EmployeeOrganizationEntity } from 'modules/tenant-database/persistance/employee-organizations.entity';
import { TenantResponse } from '../tenant/tenant.response';
import { LookUpResponse } from '../look-up/look-up.response';

export class EmployeeOrganizationsResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  tenantId: number;
  @ApiProperty()
  employeeId: string;
  @ApiProperty()
  lookupId: string;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  status: string;
  organization: TenantResponse;
  lookup: LookUpResponse;
  static toResponse(
    entity: EmployeeOrganizationEntity,
  ): EmployeeOrganizationsResponse {
    const response = new EmployeeOrganizationsResponse();
    response.id = entity.id;
    response.tenantId = entity.tenantId;
    response.employeeId = entity.employeeId;
    response.lookupId = entity.lookupId;
    response.startDate = entity.startDate;
    response.status = entity.status;
    if (entity.organization) {
      response.organization = TenantResponse.toResponse(entity.organization);
    }
    if (entity.lookup) {
      response.lookup = LookUpResponse.toResponse(entity.lookup);
    }
    return response;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { EmployeeStatus } from '@libs/common/enums';
import { UserInfo } from '@libs/common/user-info';
import { LookUpEntity } from 'modules/tenant-database/persistance/look-up-table.entity';
import { EmployeeOrganizationsResponse } from '../employees-Organization/organization-employees.response';

export class LookUpResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  fullName: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  middleName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  tin: string;
  @ApiProperty()
  jobTitle: string;
  @ApiProperty()
  tenantId: number;

  // @ApiProperty()
  // organizationSchemaName: string;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  hasBackOfficeAccess: boolean;

  @ApiProperty()
  status: EmployeeStatus;
  currentUser?: UserInfo;
  organization: EmployeeOrganizationsResponse[];
  static toResponse(entity: LookUpEntity): LookUpResponse {
    const response = new LookUpResponse();
    response.id = entity.id;
    response.employeeId = entity.employeeId;
    response.fullName = entity.fullName;
    response.firstName = entity.firstName;
    response.middleName = entity.middleName;
    response.lastName = entity.lastName;
    response.email = entity.email;
    response.tin = entity.tin;
    response.jobTitle = entity.jobTitle;
    // response.organizationSchemaName = entity.organizationSchemaName;
    response.phoneNumber = entity.phoneNumber;
    response.hasBackOfficeAccess = entity.hasBackOfficeAccess;
    response.status = entity.status;
    if (entity.employeeOrganization) {
      response.organization =entity.employeeOrganization.map((item)=>EmployeeOrganizationsResponse.toResponse(item));
    }
    return response;
  }
}

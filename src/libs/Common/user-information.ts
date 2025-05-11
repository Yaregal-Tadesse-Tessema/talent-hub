/* eslint-disable prettier/prettier */
import { FileDto } from "./dtos/file.dto";

export type RoleInfo = {
  id: string;
  name: string;
  key: string;
};

// export type PermissionInfo = {
//   //id: string;
//   //name: string;
//   key: string;
// };
export type UserInfo = {
  id: string;
  lookupId?: string;
  tenantId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  workEmail?: string;
  departmentId?: string;
  phoneNumber?: string;
  roles?: RoleInfo[];
  departmentName?: string;
  organizationName?: string;
  organizationSchemaName?: string;
  organizationId?: number;
  gender?: string;
  type?: string;
  profileImage?: FileDto;
//   address?: Address;
  enablePortalAccess?: boolean;
  preferredName?: string;
  hasBackofficeAccess?: boolean;
  appId?: string;
//   employeeRoles?:EmployeeRoleResponse[]
};

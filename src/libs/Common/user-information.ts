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
  email?: string;
  phoneNumber?: string;
  roles?: RoleInfo[];
  tenantName?: string;
  tenantSchemaName?: string;
  profileImage?: FileDto;
  address?: any;
  preferredName?: string;
};

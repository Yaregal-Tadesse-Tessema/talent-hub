/* eslint-disable prettier/prettier */

import { EmployeeStatus } from '../user/usecase/user.command';

export enum AccountTypeEnums {
  EMPLOYER = 'employer',
  EMPLOYEE = 'employee',
  ADMIN = 'Admin',
}
export enum AccountStatusEnums {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  InACTIVE = 'Inactive',
  DISABLED = 'Disabled',
  DRAFT = 'Draft',
}

export const activeEmployeesStatus = [
  EmployeeStatus.ACTIVE,
  EmployeeStatus.ON_LEAVE,
  EmployeeStatus.ON_PROBATION,
  EmployeeStatus.IS_ON_WORK_FROM_HOME,
  EmployeeStatus.PENDING,
];

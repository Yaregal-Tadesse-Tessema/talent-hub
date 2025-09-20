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
}

export enum LinkTypeEnums {
  WEBSITE = 'Website',
  FACEBOOK = 'Facebook',
  LINKEDIN = 'Linkedin',
  TWITTER = 'Twitter',
  INSTAGRAM = 'Instagram',
  YOUTUBE = 'Youtube',
  TIKTOK = 'Tiktok',
  X = 'X',
  TELEGRAM = 'Telegram',
  WHATSAPP = 'Whatsapp',
  SKYPE = 'Skype',
  DISCORD = 'Discord',
  REDDIT = 'Reddit',
  PINTEREST = 'Pinterest',
  BLOG = 'Blog',
}
export const activeEmployeesStatus = [
  EmployeeStatus.ACTIVE,
  EmployeeStatus.ON_LEAVE,
  EmployeeStatus.ON_PROBATION,
  EmployeeStatus.IS_ON_WORK_FROM_HOME,
  EmployeeStatus.PENDING,
];

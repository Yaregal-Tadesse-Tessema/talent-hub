/* eslint-disable prettier/prettier */

import { ApiProperty } from '@nestjs/swagger';
import { EmployeeStatus } from '../user/usecase/user.command';

export enum AccountTypeEnums {
  EMPLOYER = 'employer',
  EMPLOYEE = 'employee',
  ADMIN = 'Admin',
}
export class SalesInformation {
  @ApiProperty()
  SalesStageInformation: { stage: string, status: SalesContactStatusEnums, remark: string }[];
  @ApiProperty()
  contactPersonel: string
  @ApiProperty()
  contactPhone: string
  @ApiProperty()
  contactEmail: string
  @ApiProperty()
  physicalAddress: string
}
export enum SalesContactStatusEnums {
  LEAD = 'Lead',
  INITIAL_CONTACTED = 'Initial Contacted',

  NOT_CONTACTED = 'Not Contacted',
}
export enum AccountStatusEnums {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  InACTIVE = 'Inactive',
  DISABLED = 'Disabled',
}
export enum OrganizationTypeEnums {
  PRIVATE = 'Private Company',
  PUBLIC = 'Public Company',
  GOVERNMENT = 'Government Company',
  NON_PROFIT = 'Non Profit',
  EDUCATION = 'Education',
  RESEARCH = 'Research',
  OTHER = 'Other',
  NGO = 'International Agency',
  SEMI_GOVERMENT = 'Semi Government',
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

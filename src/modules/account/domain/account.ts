/* eslint-disable prettier/prettier */

export class Account {
  id: string;
  categoryId: string;
  userName: string;
  password: string;
  email: string;
  status: string;
  accountType: string;
  organizationName?: string;
  organizationTin?: string;
  accountUserType: string;

  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt: Date;
  deletedBy: string;
}


export class AccountDetail {
  categoryId: string;
  organizationName?: string;
  organizationTin?: string;
}

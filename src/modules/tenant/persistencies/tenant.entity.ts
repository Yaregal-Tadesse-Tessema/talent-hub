/* eslint-disable prettier/prettier */
import { Column, Entity, OneToMany } from 'typeorm';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { CommonEntity } from 'src/libs/Common/common-entity';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { EmployeeTenantEntity } from './employee-tenant.entity';
import { TenantSubscriptionTypes } from '../constants';
import { UserTenantEntity } from './user-tenant.entity';

@Entity({ name: 'tenants' })
export class TenantEntity extends CommonEntity {
  @Column()
  name: string;
  @Column({ nullable: true })
  schemaName: string;
  @Column({ nullable: true })
  prefix?: string;
  @Column({ nullable: true })
  type: string;
  @Column({ nullable: true })
  tradeName: string;
  @Column({ nullable: true, unique: true })
  email: string;
  @Column({ nullable: true })
  code: string;
  @Column({ unique: true, nullable: true })
  phoneNumber: string;
  @Column({ type: 'jsonb', nullable: true })
  address: any;
  @Column({ default: TenantSubscriptionTypes.FREE })
  subscriptionType: TenantSubscriptionTypes;
  @Column({ default: false })
  isVerified: boolean;
  @Column({ unique: true , nullable: true})
  tin: string;
  @Column({ nullable: true })
  licenseNumber: string;
  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];
  @Column({ nullable: true })
  registrationNumber: string;
  @Column({ default: true })
  isActive: boolean;
  @Column({ default: AccountStatusEnums.ACTIVE })
  status: AccountStatusEnums;
  @Column({ nullable: true, type: 'jsonb' })
  logo: FileDto;
  @Column({ nullable: true, type: 'jsonb' })
  cover: FileDto;
  @Column({ nullable: true })
  companySize: string;
  @Column({ nullable: true })
  industry: string;
  @Column({ nullable: true })
  organizationType: string;
  @Column({ nullable: true })
  selectedCalender: string;
  @Column({ default: true })
  isProfilePublic: boolean;
  @OneToMany(() => EmployeeTenantEntity, (lookUp) => lookUp.tenant, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  organizationEmployees: EmployeeTenantEntity[];
  @OneToMany(() => UserTenantEntity, (userTenant) => userTenant.tenant, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  tenantUsers: UserTenantEntity[];
}

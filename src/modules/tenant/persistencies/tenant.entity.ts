/* eslint-disable prettier/prettier */
import { Column, Entity, OneToMany } from "typeorm";
import { FileDto } from "src/libs/Common/dtos/file.dto";
import { CommonEntity } from "src/libs/Common/common-entity";
import { AccountStatusEnums } from "src/modules/auth/constants";
import { EmployeeTenantEntity } from "./employee-tenant.entity";
import { TEnantSubscriptionTypes } from "../constants";

@Entity({ name: 'tenants' })
export class TenantEntity extends CommonEntity {

  @Column({ name: 'name' })
  name: string;
  @Column({ name: 'schema_name', nullable: true })
  schemaName: string;
  @Column({ nullable: true, name: 'prefix' })
  prefix?: string;
  @Column({ name: 'type', nullable: true })
  type: string;
  @Column({ name: 'trade_name', nullable: true })
  tradeName: string;
  @Column({ name: 'email', nullable: true })
  email: string;
  @Column({ name: 'code', nullable: false })
  code: string;
  @Column({ name: 'phone_number' })
  phoneNumber: string;
  @Column({ type: 'jsonb' })
  address: any;
  @Column({ name: 'subscription_type', default: TEnantSubscriptionTypes.FREE })
  subscriptionType: TEnantSubscriptionTypes;
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;
  @Column()
  tin: string;
  @Column({ nullable: true })
  licenseNumber: string;
  @Column({ nullable: true })
  registrationNumber: string;
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
  @Column({ nullable: true })
  status: AccountStatusEnums;
  @Column({ name: 'logo', nullable: true, type: 'jsonb' })
  logo: FileDto;
  @Column({ name: 'company_size', nullable: true })
  companySize: string;
  @Column({ name: 'industry', nullable: true })
  industry: string;
  @Column({ name: 'organization_type', nullable: true })
  organizationType: string;
  @Column({ name: 'selected_calender', nullable:true })
  selectedCalender: string;
  @OneToMany(() => EmployeeTenantEntity, (lookUp) => lookUp.tenant, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  organizationEmployees: EmployeeTenantEntity[];
}
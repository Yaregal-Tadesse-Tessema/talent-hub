/* eslint-disable prettier/prettier */
import { Column, Entity, OneToMany } from "typeorm";
import { CalenderTypeEnums, OrganizationStatusEnums } from "../constants";
import { FileDto } from "src/libs/Common/dtos/file.dto";
import { EmployeeOrganizationEntity } from "./employee-organization.entity";
import { CommonEntity } from "src/libs/Common/common-entity";

@Entity({ name: 'tenants' })
export class TenantEntity  extends CommonEntity{
  @Column({ nullable: true, name: 'prefix' })
  prefix?: string;
  @Column({ name: 'name' })
  name: string;
  @Column({ name: 'schema_name', nullable: true })
  schemaName: string;
  @Column({ name: 'type', nullable: true })
  type: string;
  @Column({ name: 'trade_name', nullable: true })
  tradeName: string;
  @Column({ name: 'email' })
  email: string;
  @Column({ name: 'code', nullable: true })
  code: string;
  @Column({ name: 'phone_number' })
  phoneNumber: string;
  @Column({ type: 'jsonb' })
  address: any;
  @Column({ name: 'subscription_type', default: 'free' })
  subscriptionType: string;
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;
  @Column()
  tin: string;
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
  @Column({ nullable: true })
  status: OrganizationStatusEnums;
  @Column({ name: 'logo', nullable: true, type: 'jsonb' })
  logo: FileDto;
  @Column({ name: 'company_size', nullable: true })
  companySize: string;
  @Column({ name: 'industry', nullable: true })
  industry: string;
  @Column({ name: 'organization_type', nullable: true })
  organizationType: string;
  @Column({ name: 'selected_calender', default: CalenderTypeEnums.ET })
  selectedCalender: CalenderTypeEnums;
  @OneToMany(
    () => EmployeeOrganizationEntity,
    (lookUp) => lookUp.tenant,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  organizationEmployees: EmployeeOrganizationEntity[];
}

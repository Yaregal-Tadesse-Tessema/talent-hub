import { Address } from '@libs/common/address';
import { FileDto } from '@libs/common/file-dto';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrganizationStatusEnums } from '../usecase/orgaization-status-enums';
import { EntityMeta } from '@libs/common/decorators/entity-prefix';
import { EmployeeOrganizationEntity } from './employee-organizations.entity';
import { CALENDERTYPEENUMS } from '../constants';

@Entity({ name: 'tenants' })
@EntityMeta('ten')
export class TenantEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;
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
  address: Address;
  @Column({ name: 'subscription_type', default: 'free' })
  subscriptionType: string;
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;
  @Column()
  tin: string;
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
  @Column({ name: 'has_salary_loan', default: false })
  hasSalaryLoan: boolean;
  @Column({ name: 'has_credit_purchase', default: false })
  hasCreditPurchase: boolean;
  @Column({ name: 'allows_negative_leave', default: false })
  allowsNegativeLeave: boolean;
  @Column({ name: 'allowed_negative_leave_amount', default: 0 })
  allowedNegativeLeaveAmount: number;
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
  @Column({ name: 'workHour', default: 8 })
  workHour: string;
  @Column({ name: 'ceo_id',nullable:true })
  ceoId: string;
  @Column({ name: 'ceo_name',nullable:true })
  ceoName: string;
  @Column({ name: 'configuration', type: 'jsonb', nullable: true })
  configuration: any;
  @Column({ name: 'selected_calender', default: CALENDERTYPEENUMS.ET })
  selectedCalender: CALENDERTYPEENUMS;
  @Column({ nullable: true, name: 'created_by' })
  createdBy?: string;
  @Column({ nullable: true, name: 'updated_by' })
  updatedBy?: string;
  @Column({type:'jsonb',nullable:true})
  wifiInfo:any
  @Column({type:'jsonb',nullable:true})
  location:any
  @Column({ name: 'monthly_work_hour', default: 208 })
  monthlyWorkHour: number;
  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
  })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
  })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamptz', nullable: true, name: 'deleted_at' })
  deletedAt: Date;
  @Column({ nullable: true, name: 'deleted_by' })
  deletedBy: string;
  @Column({ nullable: true, type: 'text', name: 'archive_reason' })
  archiveReason: string;
  @OneToMany(
    () => EmployeeOrganizationEntity,
    (lookUp) => lookUp.organization,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  organizationEmployees: EmployeeOrganizationEntity[];

  // @OneToMany(
  //   () => DocumentEntity,
  //   (employeeDocument) => employeeDocument.tenantDocument,
  //   {
  //     cascade: true,
  //     onDelete: 'CASCADE',
  //   },
  // )
  // tenantDocuments: DocumentEntity[];

}

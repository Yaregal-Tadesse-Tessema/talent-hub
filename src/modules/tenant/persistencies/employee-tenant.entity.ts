/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { LookupEntity } from './lookup.entity';
import { EmployeeStatus } from 'src/modules/user/usecase/user.command';

@Entity({ name: 'employee_tenants' })
@Unique(['tenantId', 'lookupId'])
export class EmployeeTenantEntity extends CommonEntity {
  @Column({ name: 'tenant_id', nullable: false })
  tenant_Id: string;
  @Column({ name: 'lookup_id', nullable: false })
  lookupId: string;
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;
  @Column({ name: 'status', default: 'Active' })
  status: EmployeeStatus;
  @Column({ name: 'job_title' })
  jobTitle: string;
  @Column({ name: 'tenant_name' })
  tenantName: string;
  @Column({ default: false, nullable: true })
  isAdminCreated: boolean;
  @ManyToOne(() => TenantEntity, (tenant) => tenant.organizationEmployees, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @ManyToOne(() => LookupEntity, (tenant) => tenant.employeeTenant, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lookup_id' })
  lookup: LookupEntity;
}
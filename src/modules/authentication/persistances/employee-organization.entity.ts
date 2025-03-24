/* eslint-disable prettier/prettier */
import { CommonEntity } from "src/libs/Common/common-entity";
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { LookupEntity } from './lookup.entity';

@Entity({ name: 'employee_organizations' })
@Unique(['tenantId', 'lookupId'])
export class EmployeeOrganizationEntity extends CommonEntity {
  @Column({ name: 'tenant_id' })
  tenantId: string;
  @Column({ name: 'lookup_id' })
  lookupId: string;
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;
  @Column({ name: 'status', default: 'Draft' })
  status: string;
  @Column({ name: 'job_title' })
  jobTitle: string;
  @Column({ name: 'tenant_name' })
  tenantName: string;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.organizationEmployees, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @ManyToOne(() => LookupEntity, (tenant) => tenant.employeeOrganization, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lookup_id' })
  lookup: LookupEntity;
}

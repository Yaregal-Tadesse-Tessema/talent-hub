import { CommonEntity } from '@libs/common/common.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TenantEntity } from './tenat.entity';
import { EntityMeta } from '@libs/common/decorators/entity-prefix';
import { LookUpEntity } from './look-up-table.entity';
@Entity({ name: 'employee_organizations' })
@EntityMeta('eo')
export class EmployeeOrganizationEntity extends CommonEntity {
  @Column({ name: 'tenant_id' })
  tenantId: number;
  @Column({ name: 'employee_id',nullable:true })
  employeeId: string;
  @Column({ name: 'lookup_id' })
  lookupId: string;
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;
  @Column({ name: 'status', default: 'Draft' })
  status: string;
  @ManyToOne(() => TenantEntity, (tenant) => tenant.organizationEmployees, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tenant_id' })
  organization: TenantEntity;
  @ManyToOne(() => LookUpEntity, (tenant) => tenant.employeeOrganization, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lookup_id' })
  lookup: LookUpEntity;
}

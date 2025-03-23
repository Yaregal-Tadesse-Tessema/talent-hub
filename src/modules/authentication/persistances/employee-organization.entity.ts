/* eslint-disable prettier/prettier */
import { CommonEntity } from "src/libs/Common/common-entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { TenantEntity } from "./tenant.entity";
import { LookUpEntity } from "./lookup.entity";

@Entity({ name: 'employee_organizations' })
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
  tenant: TenantEntity;

  @ManyToOne(() => LookUpEntity, (tenant) => tenant.employeeOrganization, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lookup_id' })
  lookup: LookUpEntity;
}

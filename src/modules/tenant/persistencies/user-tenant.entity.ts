/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { UserEntity } from 'src/modules/user/persistence/users.entity';

@Entity({ name: 'user_tenants' })
@Unique(['tenantId', 'userId'])
export class UserTenantEntity extends CommonEntity {
  @Column({ name: 'user_id', nullable: false })
  userId: string;
  @Column({ name: 'tenant_id', nullable: false })
  tenantId: string;
  @Column({ name: 'remark' })
  remark: string;
  @ManyToOne(() => TenantEntity, (tenant) => tenant.organizationEmployees, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;
  @ManyToOne(() => UserEntity,{
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lookup_id' })
  user: UserEntity;
}
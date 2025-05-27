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
  @Column({ name: 'organization_id', nullable: false })
  organizationId: string;
  @Column({ name: 'remark' })
  remark: string;
  @ManyToOne(() => TenantEntity, (tenant) => tenant.organizationEmployees, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'organization_id' })
  tenant: TenantEntity;
  @ManyToOne(() => UserEntity, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
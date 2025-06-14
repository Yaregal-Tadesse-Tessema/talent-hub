/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { UserEntity } from 'src/modules/user/persistence/users.entity';

@Entity({ name: 'user_tenants' })
@Unique(['organizationId', 'userId'])
export class UserTenantEntity extends CommonEntity {
  @Column({ nullable: true })
  userId: string;
  @Column({ nullable: true })
  organizationId: string;
  @Column({ name: 'remark' })
  remark: string;
  @ManyToOne(() => TenantEntity, (tenant) => tenant.organizationEmployees, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'organizationId' })
  tenant: TenantEntity;
  @ManyToOne(() => UserEntity, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
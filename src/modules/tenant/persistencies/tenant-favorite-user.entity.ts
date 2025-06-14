/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { TenantEntity } from './tenant.entity';

@Entity({ name: 'tenant_favorites_users' })
@Unique(['userId', 'tenantId'])
export class TenantFavoriteUserEntity extends CommonEntity {
  @Column()
  userId: string;
  @Column()
  tenantId: string;

  @ManyToOne(
    () => TenantEntity,
    (tenantEntity) => tenantEntity.favoriteUsers,
  )
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @ManyToOne(
    () => UserEntity,
    (userEntity) => userEntity.favoriteTenants,
  )
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}

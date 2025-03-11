/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrganizationEntity } from 'src/modules/organization/persistencies/organization.entity';

export enum AccountTypeEnums {
  ORGANIZATION = 'Organization',
  EMPLOYEE = 'employee',
  USER = 'user',
}

@Entity({ name: 'accounts' })
export class AccountEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  organizationId: string;
  @Column({ nullable: true })
  userName: string;
  @Column({ unique: true })
  email: string;
  @Column({ unique: true })
  phone: string;
  @Column()
  password: string;
  @Column({
    type: 'enum',
    enum: AccountStatusEnums,
    default: AccountStatusEnums.DRAFT,
  })
  status: AccountStatusEnums;

  @Column({ nullable: true })
  registerBy: string;

  @Column({ default: 0 })
  loginAttempts: number;

  @ManyToOne(
    () => OrganizationEntity,
    (organizationEntity) => organizationEntity.accounts,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @Column({ nullable: true })
  refreshToken: string;
  @Column({ nullable: true })
  accountToken: string;
}

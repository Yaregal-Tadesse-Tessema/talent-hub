/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { EmployeeTenantEntity } from './employee-tenant.entity';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { UserType } from '../constants';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { NotificationEntity } from 'src/modules/notification/persistencies/notification.entity';

@Entity({ name: 'lookup_table' })
export class LookupEntity extends CommonEntity {
  @Column({ nullable: true, unique: true })
  userId: string;
  @Column({ nullable: true })
  fullName: string;
  @Column({ nullable: true })
  firstName: string;
  @Column({ nullable: true })
  middleName: string;
  @Column({ nullable: true })
  lastName: string;
  @Column({ nullable: true })
  password: string;
  @Column({ unique: true })
  email: string;
  @Column({ unique: true })
  phoneNumber: string;
  @Column({ default: UserType.EMPLOYEE })
  userType: UserType;
  @Column({ default: AccountStatusEnums.PENDING })
  status: AccountStatusEnums;
  @Column({ nullable: true, type: 'jsonb' })
  profileImage: FileDto;
  @Column({ nullable: true, type: 'jsonb' })
  address: any;
  @OneToMany(() => EmployeeTenantEntity, (lookUp) => lookUp.lookup, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  employeeTenant: EmployeeTenantEntity[];

  @OneToOne(() => UserEntity, (user) => user.lookup, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(
    () => NotificationEntity,
    (notificationEntity) => notificationEntity.sender,
  )
  notifications: NotificationEntity[];
}
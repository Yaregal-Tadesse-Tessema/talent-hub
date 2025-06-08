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
  @Column({ name: 'user_id', nullable: true, unique: true })
  userId: string;
  @Column({ name: 'full_name', nullable: true })
  fullName: string;
  @Column({ name: 'first_name', nullable: true })
  firstName: string;
  @Column({ name: 'middle_name', nullable: true })
  middleName: string;
  @Column({ name: 'last_name', nullable: true })
  lastName: string;
  @Column({ name: 'password', nullable: true })
  password: string;
  @Column({ name: 'email', nullable: true, unique: true })
  email: string;
  @Column({ name: 'phone_number', unique: true })
  phoneNumber: string;
  @Column({ name: 'user_type', default: UserType.EMPLOYEE })
  userType: UserType;
  @Column({ default: AccountStatusEnums.ACTIVE })
  status: AccountStatusEnums;
  @Column({ name: 'profile_image', nullable: true, type: 'jsonb' })
  profileImage: FileDto;
  @Column({ name: 'address', nullable: true, type: 'jsonb' })
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
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(
    () => NotificationEntity,
    (notificationEntity) => notificationEntity.sender,
  )
  notifications: NotificationEntity[];
}
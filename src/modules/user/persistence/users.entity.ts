/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { UserStatusEnums } from '../constants';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
@Entity({ name: 'user' })
export class UserEntity extends CommonEntity {
  @Column({ nullable: true, unique: true })
  phone: string;
  @Column({ nullable: true, unique: true })
  email: string;
  @Column({ nullable: true })
  firstName: string;
  @Column({ nullable: true })
  middleName: string;
  @Column({ nullable: true })
  lastName: string;
  @Column({ nullable: true })
  gender: string;
  @Column({ default: UserStatusEnums.ACTIVE })
  status: UserStatusEnums;
  @Column({ nullable: true })
  password: string;

  @OneToMany(
    () => ApplicationEntity,
    (applicationEntity) => applicationEntity.user,
  )
  applications: ApplicationEntity[];
}

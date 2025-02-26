/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { UserStatusEnums } from '../constants';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
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
  @Column({ nullable: true, type: 'jsonb' })
  profile: FileDto;

  @OneToMany(
    () => ApplicationEntity,
    (applicationEntity) => applicationEntity.user,
  )
  applications: ApplicationEntity[];
}

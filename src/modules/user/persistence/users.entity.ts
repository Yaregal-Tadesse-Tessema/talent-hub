/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import {
  Entity,
  Column,
} from 'typeorm';
import { UserStatusEnums } from '../constants';
@Entity({ name: 'user' })
export class UserEntity extends CommonEntity {
  @Column({ nullable: true,unique:true })
  phone: string;
  @Column({ nullable: true,unique:true })
  email: string;
  @Column({ nullable: true, })
  firstName: string;
  @Column({ nullable: true, })
  middleName: string;
  @Column({ nullable: true,  })
  lastName: string;
  @Column({nullable:true})
  gender: string;
  @Column({default:UserStatusEnums.ACTIVE})
  status: UserStatusEnums;
  @Column({nullable:true})
  password: string;
}

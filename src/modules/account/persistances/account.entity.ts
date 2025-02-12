/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import {
  Entity,
  Column,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmployeeEntity } from './employee.entity';


export enum AccountTypeEnums {
  ORGANIZATION = 'Organization',
  EMPLOYEE = 'employee',
  USER = 'user',
}

@Entity({ name: 'accounts' })
export class AccountEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true })
  categoryId: string;
  @Column({ nullable: true })
  userName: string;
  @Column({ unique: true })
  email: string;
  @Column({ unique: true })
  phone: string;
  @Column({ unique: true, nullable: true })
  newEmail: string;
  @Column({ unique: true, nullable: true })
  newPhone: string;
  @Column()
  password: string;
  @Column({ default: 'user' })
  accountType: string;
  @Column({ nullable: true })
  accountUserType: string;
  @Column({
    type: 'enum',
    enum: AccountStatusEnums,
    default: AccountStatusEnums.DRAFT,
  })
  status: string;

  @Column({nullable:true})
  registerBy: string;

  @Column({ nullable: true, type: 'jsonb' })
  organizationName: string;

  @Column({ nullable: true })
  organizationTin: string;

  @Column({ default: 0 })
  loginAttempts: number;

 
  @OneToOne(() => EmployeeEntity, (employee) => employee.account, {
    onDelete: 'RESTRICT',
  })
  employee: EmployeeEntity;
  @Column({ nullable: true })
  refreshToken: string;
  @Column({ nullable: true })
  accountToken: string;

}

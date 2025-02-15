/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntity } from './account.entity';


@Entity({ name: 'employee' })
export class EmployeeEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true })
  woredaId: string;
  @Column({ nullable: true })
  subCityId: string;
  @Column({ nullable: true })
  cityId: string;
  @Column({ nullable: true, type: 'jsonb' })
  firstName: string;
  @Column({ nullable: true, type: 'jsonb' })
  lastName: string;
  @Column({ nullable: true, type: 'jsonb' })
  middleName: string;
  @Column({ nullable: true })
  signatureId: string;
  @Column({ nullable: true })
  gender: string;
  @Column({ default: 'employee' })
  type: string;
  @Column({ nullable: true })
  registrationNumber: string;
  @Column({ nullable: true })
  accountId: string;
  @Column({ default: 'In Active' })
  status: string;
  @Column({ nullable: true, type: 'date' })
  dateOfBirth: Date;
  @Column({ nullable: true })
  martialStatus: string;

  @Column({ type: 'uuid', nullable: true })
  employmentPositionId: string;

  @Column({ nullable: true })
  profilePicture: string;


 




  // @JoinColumn({ name: 'accountId' })
  // @OneToOne(() => AccountEntity, (account) => account.employee, {
  //   cascade: true,
  // })
  // account: AccountEntity;
 
}

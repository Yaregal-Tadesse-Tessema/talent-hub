/* eslint-disable prettier/prettier */

import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity } from 'typeorm';
import { UserStatusEnums } from '../constants';
import { FileDto } from 'src/libs/Common/dtos/file.dto';

@Entity('admin_users')
export class AdminUserEntity extends CommonEntity {
  @Column({ name: 'first_name' })
  firstName: string;
  @Column({ name: 'middle_name', nullable: true })
  middleName: string;
  @Column({ name: 'last_name', nullable: true })
  lastName: string;
  @Column({ name: 'preferred_name', nullable: true })
  preferredName: string;
  @Column({ name: 'email', nullable: true })
  email: string;
  @Column({ name: 'work_email', nullable: true })
  workEmail: string;
  @Column({ name: 'user_name', nullable: true })
  userName: string;
  @Column({ name: 'phone_number', type: 'varchar', nullable: true })
  phoneNumber: string;
  @Column({ name: 'employee_number', nullable: true })
  employeeNumber: string;
  @Column({ nullable: true })
  gender: string;
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;
  @Column({ name: 'marital_status', nullable: true })
  maritalStatus: string;
  @Column({ type: 'jsonb', nullable: true })
  address: any;
  @Column({ name: 'start_date',type:'date', nullable: true })
  startDate: Date;
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;
  @Column({ name: 'job_title', nullable: true })
  jobTitle: string;
  @Column({ name: 'password', nullable: true })
  password: string;
  @Column({ nullable: true })
  tin: string;
  @Column({ nullable: true })
  status: UserStatusEnums;
  @Column({ nullable: true })
  nationality: string;
  @Column({ name: 'emergency_contact', nullable: true, type: 'jsonb' })
  emergencyContact: any;
  @Column({ name: 'profile_image', nullable: true, type: 'jsonb' })
  profileImage: FileDto;

}

/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { EmployeeOrganizationEntity } from './employee-organization.entity';
import { UserStatusEnums } from '../constants';

@Entity({ name: 'look_up_table' })
export class LookUpEntity extends CommonEntity {
  @Column({ name: 'employee_id', nullable: true })
  employeeId: string;
  @Column({ name: 'full_name', nullable: true })
  fullName: string;
  @Column({ name: 'first_name', nullable: true })
  firstName: string;
  @Column({ name: 'middle_name', nullable: true })
  middleName: string;
  @Column({ name: 'last_name', nullable: true })
  lastName: string;
  @Column({ name: 'tin', nullable: true })
  tin: string;
  @Column({ name: 'job_title', nullable: true })
  jobTitle: string;
  @Column({ name: 'password', nullable: true })
  password: string;
  @Column({ name: 'email', nullable: true })
  email: string;
  @Column({ name: 'phone_number', unique: true })
  phoneNumber: string;
  @Column({ default: UserStatusEnums.ACTIVE })
  status: UserStatusEnums;

  @OneToMany(() => EmployeeOrganizationEntity, (lookUp) => lookUp.lookup, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  employeeOrganization: EmployeeOrganizationEntity[];
}

import { CommonEntity } from '@libs/common/common.entity';
import { EmployeeStatus } from '@libs/common/enums';
import { Column, Entity, OneToMany } from 'typeorm';
import { EntityMeta } from '@libs/common/decorators/entity-prefix';
import { EmployeeOrganizationEntity } from './employee-organizations.entity';
@Entity({ name: 'look_up_table' })
@EntityMeta('lut')
export class LookUpEntity extends CommonEntity {
  @Column({ name: 'employee_id',nullable:true })
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
  @Column({ name: 'access_token', nullable: true })
  accessToken: string;
  @Column({ name: 'phone_number', unique: true })
  phoneNumber: string;
  @Column({ name: 'has_back_office_access', default: false })
  hasBackOfficeAccess: boolean;
  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;
  @Column({ default: EmployeeStatus.ACTIVE })
  status: EmployeeStatus;
  @OneToMany(() => EmployeeOrganizationEntity, (lookUp) => lookUp.lookup, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  employeeOrganization: EmployeeOrganizationEntity[];

}

import { Address } from '@libs/common/address';
import { CommonEntity } from '@libs/common/common.entity';
import { EntityMeta } from '@libs/common/decorators/entity-prefix';
import { EmergencyContact } from '@libs/common/emergency-contact';
import { EmployeeStatus, PhoneCommand } from '@libs/common/enums';
import { FileDto } from '@libs/common/file-dto';
import { Column, Entity } from 'typeorm';

@Entity('admin_users')
@EntityMeta('ad')
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
  @Column({ name: 'level', nullable: true })
  level: string;
  @Column({ name: 'work_email', nullable: true })
  workEmail: string;
  @Column({ name: 'user_name', nullable: true })
  userName: string;
  @Column({ name: 'work_phone_numbers', type: 'jsonb', nullable: true })
  workPhoneNumbers: PhoneCommand[];
  @Column({ name: 'personal_phone_numbers', type: 'jsonb', nullable: true })
  personalPhoneNumbers: PhoneCommand[];
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
  address: Address;
  @Column({ name: 'start_date',type:'date', nullable: true })
  startDate: Date;
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;
  @Column({ name: 'job_title', nullable: true })
  jobTitle: string;
  @Column({ nullable: true })
  seniority: string;
  @Column({ nullable: true })
  branch: string;
  @Column({ nullable: true })
  costCenter: string;
  @Column({ nullable: true })
  workLocation: string;
  @Column({ name: 'password', nullable: true })
  password: string;
  @Column({ name: 'department_id', nullable: true })
  departmentId: string;
  @Column({ name: 'supervisor_id', nullable: true })
  supervisorId: string;
  @Column({ name: 'employment_type', nullable: true })
  employmentType: string;
  @Column({ name: 'basic_salary', type: 'float', nullable: true })
  basicSalary: number;
  @Column({ name: 'other_company_basic_salary', type: 'float', nullable: true })
  otherCompanyBasicSalary: number;
  @Column({ nullable: true, default: false })
  isManagementOrExecutive: boolean;
  @Column({ nullable: true })
  currency: string;
  @Column({ name: 'per_hour_salary', type: 'float', nullable: true })
  hourlyRate: number;
  @Column({ nullable: true })
  tin: string;
  @Column({ nullable: true, default: false })
  isHourlyEmployee: boolean;
  @Column({ nullable: true })
  status: EmployeeStatus;
  @Column({ nullable: true })
  nationality: string;
  @Column({ name: 'emergency_contact', nullable: true, type: 'jsonb' })
  emergencyContact: EmergencyContact;
  @Column({ name: 'profile_image', nullable: true, type: 'jsonb' })
  profileImage: FileDto;
  @Column({ name: 'enable_portal_access', default: false })
  enablePortalAccess: boolean;
  @Column({ name: 'has_back_office_access', default: false })
  hasBackOfficeAccess: boolean;
  @Column({ name: 'has_pension_contribution', default: false })
  hasPensionContribution: boolean;
  @Column({ name: 'pension_exemption_letter', nullable: true, type: 'jsonb' })
  pensionExemptionLetter: FileDto;
  @Column({
    name: 'cost_sharing_exemption_letter',
    nullable: true,
    type: 'jsonb',
  })
  costSharingExemptionLetter: FileDto;
  @Column({
    name: 'concurrent_employment_verification',
    nullable: true,
    type: 'jsonb',
  })
  concurrentEmploymentVerification: FileDto;

  @Column({ type: 'date', nullable: true })
  lastWorkingDate: Date;

  @Column({ type: 'date', nullable: true })
  leaveReason: string;
}

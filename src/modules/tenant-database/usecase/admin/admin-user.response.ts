import { DepartmentResponse } from '@configurations/usecases/departments/department.response';
import { Address } from '@libs/common/address';
import { EmergencyContact } from '@libs/common/emergency-contact';
import { FileDto } from '@libs/common/file-dto';
import { ApiProperty } from '@nestjs/swagger';
import { PhoneCommand } from '@libs/common/enums';
import { AdminUserEntity } from 'modules/tenant-database/persistance/admin-user.entity';

export class AdminUserResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  middleName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  preferredName: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  level: string;
  @ApiProperty()
  userName: string;
  @ApiProperty()
  workEmail: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  workPhoneNumbers: PhoneCommand[];
  @ApiProperty()
  personalPhoneNumbers: PhoneCommand[];
  @ApiProperty()
  employeeNumber: string;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  dateOfBirth: Date;
  @ApiProperty()
  address: Address;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  isHourlyEmployee: boolean;
  @ApiProperty()
  endDate: Date;
  @ApiProperty()
  jobTitle: string;
  @ApiProperty()
  seniority: string;
  @ApiProperty()
  departmentId: string;
  @ApiProperty()
  managerId: string;
  @ApiProperty()
  supervisorId: string;
  @ApiProperty()
  employmentType: string;
  @ApiProperty()
  basicSalary: number;
  @ApiProperty()
  otherCompanyBasicSalary: number;
  @ApiProperty()
  isManagementOrExecutive?: boolean;
  @ApiProperty()
  currency: string;
  @ApiProperty()
  branch: string;
  @ApiProperty()
  workLocation: string;
  @ApiProperty()
  costCenter: string;
  @ApiProperty()
  hourlyRate: number;
  @ApiProperty()
  tin: string;
  @ApiProperty()
  pensionNumber: string;
  @ApiProperty()
  enablePortalAccess: boolean;
  @ApiProperty()
  hasBackOfficeAccess: boolean;
  @ApiProperty()
  holdsMultipleJobs: boolean;
  @ApiProperty()
  hasPensionContribution: boolean;
  @ApiProperty()
  isShareHolder: boolean;
  @ApiProperty()
  status: string;
  @ApiProperty()
  maritalStatus: string;
  @ApiProperty()
  nationality: string;
  @ApiProperty()
  lastWorkingDate: Date;
  @ApiProperty()
  leaveReason: string;
  @ApiProperty()
  pensionExemptionLetter: FileDto;
  @ApiProperty()
  costSharingExemptionLetter: FileDto;
  @ApiProperty()
  concurrentEmploymentVerification: FileDto;
  @ApiProperty()
  profileImage: FileDto;
  @ApiProperty()
  emergencyContact: EmergencyContact;
  @ApiProperty()
  createdBy: string;
  @ApiProperty()
  updatedBy: string;
  @ApiProperty()
  deletedBy: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  deletedAt: Date;
  @ApiProperty()
  department?: DepartmentResponse;
  static toResponse(employee: AdminUserEntity): AdminUserResponse {
    const response = new AdminUserResponse();
    response.id = employee.id;
    response.firstName = employee.firstName;
    response.middleName = employee.middleName;
    response.lastName = employee.lastName;
    response.preferredName = employee.preferredName;
    response.email = employee.email;
    response.level = employee.level;
    response.userName = employee.userName;
    response.workEmail = employee.workEmail;
    response.phoneNumber = employee.phoneNumber;
    response.workPhoneNumbers = employee.workPhoneNumbers;
    response.personalPhoneNumbers = employee.personalPhoneNumbers;
    response.employeeNumber = employee.employeeNumber;
    response.gender = employee.gender;
    response.maritalStatus = employee.maritalStatus;
    response.isHourlyEmployee = employee.isHourlyEmployee;
    response.costCenter = employee.costCenter;
    response.branch = employee.branch;
    response.workLocation = employee.workLocation;
    response.dateOfBirth = employee.dateOfBirth;
    response.address = employee.address;
    response.startDate = employee.startDate;
    response.endDate = employee.endDate;
    response.jobTitle = employee.jobTitle;
    response.seniority = employee.seniority;
    response.supervisorId = employee.supervisorId;
    response.employmentType = employee.employmentType;
    response.basicSalary = employee.basicSalary;
    response.pensionExemptionLetter = employee.pensionExemptionLetter;
    response.costSharingExemptionLetter = employee.costSharingExemptionLetter;
    response.concurrentEmploymentVerification =
      employee?.concurrentEmploymentVerification;
    response.otherCompanyBasicSalary = employee.otherCompanyBasicSalary;
    response.isManagementOrExecutive = employee.isManagementOrExecutive;
    response.currency = employee.currency;
    response.hourlyRate = employee.hourlyRate;
    response.tin = employee.tin;
    response.status = employee.status;
    response.nationality = employee.nationality;
    response.profileImage = employee.profileImage;
    response.emergencyContact = employee.emergencyContact;
    response.enablePortalAccess = employee.enablePortalAccess;
    response.hasBackOfficeAccess = employee.hasBackOfficeAccess;
    response.hasPensionContribution = employee.hasPensionContribution;
    response.lastWorkingDate = employee.lastWorkingDate;
    response.leaveReason = employee.leaveReason;
    response.departmentId = employee.departmentId;
    response.createdBy = employee.createdBy;
    response.updatedBy = employee.updatedBy;
    response.deletedBy = employee.deletedBy;
    response.createdAt = employee.createdAt;
    response.updatedAt = employee.updatedAt;
    response.deletedAt = employee.deletedAt;
    return response;
  }
}

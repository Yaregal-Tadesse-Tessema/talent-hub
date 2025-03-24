/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { AdminUserEntity } from '../persistances/admin-user.entity';
import { UserStatusEnums } from '../constants';
export class CreateAdminUserCommand {
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
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
  workEmail: string;
  @ApiProperty()
  userName: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  employeeNumber: string;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  dateOfBirth: Date;
  @ApiProperty()
  maritalStatus: string;
  @ApiProperty()
  address: any;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  endDate: Date;
  @ApiProperty()
  jobTitle: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  tin: string;
  @ApiProperty()
  status: UserStatusEnums;
  @ApiProperty()
  nationality: string;
  @ApiProperty()
  emergencyContact: any;
  @ApiProperty()
  profileImage: FileDto;
  currentUser?: any;

  static fromCommand(
    command: CreateAdminUserCommand,
  ): AdminUserEntity {
    const entity = new AdminUserEntity();
    entity.id = command?.id;
    entity.firstName = command.firstName;
    entity.middleName = command.middleName;
    entity.lastName = command.lastName;
    entity.preferredName = command.preferredName;
    entity.email = command.email;
    entity.workEmail = command.workEmail;
    entity.userName = command.userName;
    entity.phoneNumber = command.phoneNumber;
    entity.employeeNumber = command.employeeNumber;
    entity.gender = command.gender;
    entity.dateOfBirth = command.dateOfBirth;
    entity.maritalStatus = command.maritalStatus;
    entity.address = command.address;
    entity.startDate = command.startDate;
    entity.endDate = command.endDate;
    entity.jobTitle = command.jobTitle;
    entity.password = command.password;
    entity.tin = command.tin;
    entity.status = command.status;
    entity.nationality = command.nationality;
    entity.emergencyContact = command.emergencyContact;
    entity.profileImage = command.profileImage;
 
    return entity;
  }
}
export class UpdateAdminUserCommand extends CreateAdminUserCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}
export class AdminUserResponse extends CreateAdminUserCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}
export class ArchiveAdminUserCommand {
  @ApiProperty({
    example: 'uuid',
  })
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  reason: string;

  currentUser: any;
}

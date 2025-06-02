/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { CreateAdminCommand } from './admin.command';
import { IsNotEmpty } from 'class-validator';
import { AdminUserEntity } from '../../persistencies/admin.entity';

export class AdminUSerResponse extends CreateAdminCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  static toResponse(command: AdminUserEntity): AdminUSerResponse {
    const entity = new AdminUSerResponse();
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
    entity.status = command.status;
    entity.emergencyContact = command.emergencyContact;
    entity.profileImage = command.profileImage;
    return entity;
  }
}

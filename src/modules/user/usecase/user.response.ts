/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../persistence/users.entity';
import { UserStatusEnums } from '../constants';
export class UserResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  middleName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  status: UserStatusEnums;
  @ApiProperty()
  birthDate: Date;
  @ApiProperty()
  linkedinUrl: string;
  @ApiProperty()
  portfolioUrl: string;
  @ApiProperty()
  yearOfExperience: number;
  @ApiProperty()
  industry: string[];
  @ApiProperty()
  preferredJobLocation: string[];
  @ApiProperty()
  highestLevelOfEducation: string;
  @ApiProperty()
  salaryExpectations: number;
  @ApiProperty()
  aiGeneratedJobFitScore: number;

  @ApiProperty()
  profile: any;
  static toResponse(entity: UserEntity): UserResponse {
    const response = new UserResponse();
    if (!entity) {
      return null;
    }
    response.id = entity?.id;
    response.phone = entity.phone;
    response.email = entity.email;
    response.firstName = entity?.firstName;
    response.middleName = entity?.middleName;
    response.lastName = entity?.lastName;
    response.gender = entity?.gender;
    response.status = entity?.status;
    response.birthDate = entity?.birthDate;
    response.linkedinUrl = entity?.linkedinUrl;
    response.portfolioUrl = entity?.portfolioUrl;
    response.yearOfExperience = entity?.yearOfExperience;
    response.industry = entity?.industry;
    response.preferredJobLocation = entity?.preferredJobLocation;
    response.highestLevelOfEducation = entity?.highestLevelOfEducation;
    response.salaryExpectations = entity?.salaryExpectations;
    response.aiGeneratedJobFitScore = entity?.aiGeneratedJobFitScore;
    response.profile = entity?.profile;
    return response;
  }
}


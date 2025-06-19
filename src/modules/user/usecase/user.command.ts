/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { UserEntity } from '../persistence/users.entity';
import {
  EducationLevelEnums,
  SocialMediaLinks,
  UserStatusEnums,
} from '../constants';
export class CreateUserCommand {
  id?: string;
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
  @ApiProperty({ default: UserStatusEnums.ACTIVE })
  status: UserStatusEnums;
  @ApiProperty()
  password: string;
  @ApiProperty()
  address: any;
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
  telegramUserId: string;
  @ApiProperty()
  preferredJobLocation: string[];
  @ApiProperty({ default: EducationLevelEnums.DIPLOMA })
  highestLevelOfEducation: EducationLevelEnums;
  @ApiProperty()
  salaryExpectations: number;
  @ApiProperty()
  aiGeneratedJobFitScore: number;
  @ApiProperty()
  technicalSkills: string[];
  @ApiProperty()
  softSkills: string[];
  @ApiProperty()
  profile: any;
  @ApiProperty()
  resume: any;
  @ApiProperty()
  educations: any;
  @ApiProperty()
  experiences: any;
  @ApiProperty()
  socialMediaLinks: SocialMediaLinks;
  @ApiProperty()
  profileHeadLine: string;
  @ApiProperty()
  coverLetter: string;
  @ApiProperty()
  professionalSummery: string;
  @ApiProperty()
  alertConfiguration?: UserAlertConfiguration;
  static fromDto(dto: CreateUserCommand): UserEntity {
    const entity = new UserEntity();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.phone = dto.phone;
    entity.email = dto.email;
    entity.firstName = dto?.firstName;
    entity.middleName = dto?.middleName;
    entity.lastName = dto?.lastName;
    entity.gender = dto?.gender;
    entity.status = dto?.status;
    entity.birthDate = dto?.birthDate;
    entity.address = dto?.address;
    entity.linkedinUrl = dto?.linkedinUrl;
    entity.portfolioUrl = dto?.portfolioUrl;
    entity.yearOfExperience = dto?.yearOfExperience;
    entity.industry = dto?.industry;
    entity.preferredJobLocation = dto?.preferredJobLocation;
    entity.highestLevelOfEducation = dto?.highestLevelOfEducation;
    entity.salaryExpectations = dto?.salaryExpectations;
    entity.aiGeneratedJobFitScore = dto?.aiGeneratedJobFitScore;
    entity.telegramUserId = dto?.telegramUserId;
    entity.profile = dto?.profile;
    entity.resume = dto?.resume;
    entity.softSkills = dto?.softSkills;
    entity.technicalSkills = dto?.technicalSkills;
    entity.educations = dto?.educations;
    entity.experiences = dto?.experiences;
    entity.socialMediaLinks = dto?.socialMediaLinks;
    entity.profileHeadLine = dto?.profileHeadLine;
    entity.coverLetter = dto?.coverLetter;
    entity.professionalSummery = dto?.professionalSummery;
    entity.alertConfiguration = dto?.alertConfiguration;

    return entity;
  }
  static fromDtos(dto: CreateUserCommand[]): UserEntity[] {
    return dto?.map((d) => CreateUserCommand.fromDto(d));
  }
}
export class UpdateUserCommand extends CreateUserCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export enum CvTemplateEnums {
  EuroPass = 'EuroPass',
  GitConnect = 'GitConnect',
}
export class AccountPasswordChange {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  oldPassword?: string;
  @ApiProperty()
  @IsNotEmpty()
  newPassword: string;
  @ApiProperty()
  @IsNotEmpty()
  confirmNewPassword: string;
}
export enum EmployeeStatus {
  ACTIVE = 'Active',
  ON_LEAVE = 'On Leave',
  TERMINATED = 'Terminated',
  SUSPENDED = 'Suspended',
  INACTIVE = 'Inactive',
  RESIGNED = 'Resigned',
  RETIRED = 'Retired',
  SECONDED = 'Seconded',
  ON_PROBATION = 'On Probation',
  IS_ON_WORK_FROM_HOME = 'Is On Work From Home',
}

export class UserAlertConfiguration {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  salary: string;
  @ApiProperty()
  jobTitle?: string;
  @ApiProperty()
  Position: string;
  @ApiProperty()
  address: string;
  @ApiProperty()
  tenantsId: string[];
  @ApiProperty()
  industry?: string;
}
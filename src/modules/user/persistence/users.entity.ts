/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { UserStatusEnums } from '../constants';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
@Entity({ name: 'user' })
export class UserEntity extends CommonEntity {
  @Column({ nullable: true, unique: true })
  phone: string;
  @Column({ nullable: true, unique: true })
  email: string;
  @Column({ nullable: true })
  firstName: string;
  @Column({ nullable: true })
  middleName: string;
  @Column({ nullable: true })
  lastName: string;
  @Column({ nullable: true, type: 'text', array: true })
  skills: string[];
  @Column({ nullable: true })
  gender: string;
  @Column({ default: UserStatusEnums.ACTIVE })
  status: UserStatusEnums;
  @Column({ nullable: true })
  password: string;
  @Column({ nullable: true, type: 'decimal' })
  gpa: number;
  @Column({ nullable: true })
  birthDate: Date;
  @Column({ nullable: true })
  linkedinUrl: string;
  @Column({ nullable: true })
  portfolioUrl: string;
  @Column({ nullable: true, type: 'decimal' })
  yearOfExperience: number;
  @Column({ type: 'text', array: true, nullable: true })
  industry: string[];
  @Column({ type: 'text', array: true, nullable: true })
  preferredJobLocation: string[];
  @Column({ nullable: true })
  highestLevelOfEducation: string;
  @Column({ nullable: true, type: 'decimal' })
  salaryExpectations: number;
  @Column({ nullable: true, type: 'decimal' })
  aiGeneratedJobFitScore: number;
  @Column({ nullable: true })
  telegramUserId: string;
  @Column({ nullable: true, type: 'jsonb' })
  profile: FileDto;
  @Column({ nullable: true, type: 'jsonb' })
  resume: FileDto;
  @OneToMany(
    () => ApplicationEntity,
    (applicationEntity) => applicationEntity.user,
  )
  applications: ApplicationEntity[];
}

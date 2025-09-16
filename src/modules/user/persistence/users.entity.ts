/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { SocialMediaLinks, UserStatusEnums } from '../constants';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { LookupEntity } from 'src/modules/tenant/persistencies/lookup.entity';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
import { SaveJobEntity } from 'src/modules/job-posting/job/persistencies/save-job-post.entity';
import { UserFavoriteJobEntity } from 'src/modules/job-posting/job/persistencies/user-favorite-job.entity';
import { NotificationEntity } from 'src/modules/notification/persistencies/notification.entity';
import { NotificationSetting, UserAlertConfiguration } from '../usecase/user.command';
import { CreateEducationCommand } from '../usecase/education.command';
import { CreateExperienceCommand } from '../usecase/experience.command';
@Entity({ name: 'users' })
export class UserEntity extends CommonEntity {
  @Column({ unique: true, nullable: true })
  phone: string;
  @Column({ unique: true, nullable: true })
  email: string;
  @Column({ nullable: true })
  firstName: string;
  @Column({ nullable: true })
  middleName: string;
  @Column({ nullable: true })
  lastName: string;
  @Column({ nullable: true, type: 'text', array: true })
  softSkills: string[];
  @Column({ nullable: true, type: 'text', array: true })
  technicalSkills: string[];
  @Column({ nullable: true })
  gender: string;
  @Column({ default: UserStatusEnums.PENDING })
  status: UserStatusEnums;
  @Column({ nullable: true })
  password: string;
  @Column({ nullable: true, type: 'decimal' })
  gpa: number;
  @Column({ nullable: true, type: 'jsonb' })
  address: any;
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
  @Column({ type: 'text', array: true, nullable: true })
  currentLocation: string[];
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
  @Column({ nullable: true, type: 'jsonb' })
  socialMediaLinks: SocialMediaLinks;
  @Column({ nullable: true })
  profileHeadLine: string;
  @Column({ nullable: true })
  coverLetter: string;
  @Column({ nullable: true })
  professionalSummery: string;
  @Column({ nullable: true, type: 'jsonb' })
  educations: CreateEducationCommand[];
  @Column({ nullable: true, type: 'jsonb' })
  experiences: CreateExperienceCommand[];
  @Column({ default: true })
  isProfilePublic: boolean;
  @Column({ default: true })
  isResumePublic: boolean;
  @Column({ type: 'json',  nullable: true })
  notificationSetting: NotificationSetting;
  @Column({ nullable: true, type: 'jsonb' })
  alertConfiguration: UserAlertConfiguration[];
  @Column({ nullable: true, type: 'jsonb' })
  smsAlertConfiguration: UserAlertConfiguration[];
  @Column({ default: true })
  isFirstTime: boolean;
  @Column({ default: false })
  isPayingUser: boolean;
  @Column({ default: false })
  isHired: boolean;
  @Column({type:'date', default: () => 'CURRENT_TIMESTAMP' })
  lastLoginDate: Date;
  @Column({default: true })
  reciveNotification: boolean;
  @OneToMany(
    () => ApplicationEntity,
    (applicationEntity) => applicationEntity.user,
  )
  applications: ApplicationEntity[];

  @OneToMany(() => SaveJobEntity, (applicationEntity) => applicationEntity.user)
  savedJobs: SaveJobEntity[];

  @OneToOne(() => LookupEntity, (lookup) => lookup.user, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  lookup: LookupEntity;

  @OneToMany(
    () => UserFavoriteJobEntity,
    (userFavoriteJobEntity) => userFavoriteJobEntity.user,
  )
  favoriteJobs: UserFavoriteJobEntity[];

  @OneToMany(
    () => NotificationEntity,
    (notificationEntity) => notificationEntity.user,
  )
  notifications: NotificationEntity[];
}

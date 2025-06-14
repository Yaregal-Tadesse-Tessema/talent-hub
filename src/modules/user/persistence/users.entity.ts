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
import { TenantFavoriteUserEntity } from 'src/modules/tenant/persistencies/tenant-favorite-user.entity';
@Entity({ name: 'users' })
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
  educations: any;
  @Column({ nullable: true, type: 'jsonb' })
  experiences: any;

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
    () => TenantFavoriteUserEntity,
    (tenantFavoriteUserEntity) => tenantFavoriteUserEntity.user,
  )
  favoriteTenants: TenantFavoriteUserEntity[];

  @OneToMany(
    () => NotificationEntity,
    (notificationEntity) => notificationEntity.user,
  )
  notifications: NotificationEntity[];
}

/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import {
  AppliedThroughEnums,
  EmploymentTypeEnums,
  JobPostingStatusEnums,
  PaymentTypeEnums,
  SalaryRangeEnum,
  WorkTypeEnums,
} from '../../constants';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { SaveJobEntity } from './save-job-post.entity';
import { PreScreeningQuestionEntity } from './pre-screening-question.entity';
import { UserFavoriteJobEntity } from 'src/modules/job-posting/job/persistencies/user-favorite-job.entity';
import { TenantEntity } from 'src/modules/tenant/persistencies/tenant.entity';

@Entity({ name: 'job_postings' })
export class JobPostingEntity extends CommonEntity {
  @Column()
  title: string;
  @Column({ nullable: true })
  description: string;
  @Column()
  position: string;

  @Column({ nullable: true })
  industry: string;
  @Column({ default: WorkTypeEnums.ON_SITE })
  workMode: WorkTypeEnums;
  @Column({ default: 'Addis Abeba' })
  city: string;
  @Column({ nullable: true })
  location: string;
  @Column({ default: EmploymentTypeEnums.FULL_TIME })
  employmentType: EmploymentTypeEnums;
  @Column({ nullable: true, type: 'jsonb' })
  salaryRange: SalaryRangeEnum;
  @Column({
    default: () => `CURRENT_DATE + INTERVAL '1 month'`,
    nullable: false,
  })
  deadline: Date;
  @Column('text', { array: true })
  skill: string[];
  @Column('text', { array: true, nullable: true })
  benefits: string[];
  @Column('text', { array: true, nullable: true })
  responsibilities: string[];
  @Column({ default: JobPostingStatusEnums.DRAFT })
  status: JobPostingStatusEnums;
  @Column({ nullable: true })
  gender: string;
  @Column({ nullable: true })
  requiredYearOfExperience: number;
  @Column({ type: 'decimal', nullable: true })
  minimumGPA: number;
  @Column({ nullable: true })
  companyName: string;
  @Column({ type: 'jsonb', nullable: true })
  companyLogo: FileDto;
  @Column({ type: 'date', nullable: true })
  postedDate: Date;
  @Column({ nullable: true })
  applicationURL: string;
  @Column({ nullable: true })
  experienceLevel: string;
  @Column({ nullable: true })
  fieldOfStudy: string;
  @Column({ nullable: true })
  educationLevel: string;
  @Column({ nullable: true })
  howToApply: string;
  @Column({ nullable: true })
  onHoldDate: Date;
  @Column({ default: 0 })
  applicationCount: number;
  @Column('text', { array: true, nullable: true })
  jobPostRequirement: string[];
  @Column({ default: 1 })
  positionNumbers: number;
  @Column({ nullable: true })
  paymentType: PaymentTypeEnums;
  @Column({ nullable: true })
  appliedThrough: AppliedThroughEnums;
  @Column({ default: false })
  isFeatured: boolean;
  @Column({ default: false })
  hasAiFilter: boolean;
  @Column({ default: true })
  hasNormalFilter: boolean;
  @Column({ nullable: true, default: false })
  isAdminCreated: boolean;
  @Column({ type: 'text', array: true, nullable: true, default: () => "ARRAY[]::text[]" })
  requiredattachements: string[];
  @OneToMany(
    () => ApplicationEntity,
    (applicationEntity) => applicationEntity.JobPost,
    { cascade: true }

  )
  applications: ApplicationEntity[];

  @OneToMany(
    () => SaveJobEntity,
    (saveJobEntity) => saveJobEntity.jobPosting,
    { cascade: true }
  )
  savedUsers: SaveJobEntity[];

  @OneToMany(
    () => PreScreeningQuestionEntity,
    (applicationEntity) => applicationEntity.jobPosting,
    { cascade: true }
  )
  preScreeningQuestions: PreScreeningQuestionEntity[];

  @OneToMany(
    () => UserFavoriteJobEntity,
    (userFavoriteJobEntity) => userFavoriteJobEntity.jobPost,
    { cascade: true }

  )
  favoriteJobs: UserFavoriteJobEntity[];

  @ManyToOne(
    () => TenantEntity,
    (tenantEntity) => tenantEntity.jobPostings,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;
}

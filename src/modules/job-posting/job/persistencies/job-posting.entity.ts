/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import {
  EmploymentTypeEnums,
  JobPostingStatusEnums,
  SalaryRangeEnum,
  WorkTypeEnums,
} from '../../constants';
import { JobRequirementEntity } from '../../job-requirement/persistance/job-requirement.entity';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { SaveJobEntity } from './save-job-post.entity';

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
  type: WorkTypeEnums;
  @Column({ default: 'Addis Abeba' })
  city: string;
  @Column({ nullable: true })
  location: string;

  @Column({ default: EmploymentTypeEnums.FULL_TIME })
  employmentType: EmploymentTypeEnums;
  @Column({ nullable: true, type: 'jsonb' })
  salaryRange: SalaryRangeEnum;
  @Column()
  organizationId: string;
  @Column({
    default: () => `CURRENT_DATE + INTERVAL '1 month'`,
    nullable: false,
  })
  deadline: Date;
  @Column()
  requirementId: string;
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
  @ManyToOne(
    () => JobRequirementEntity,
    (institutionEntity) => institutionEntity.jobPostings,
  )
  @JoinColumn({ name: 'requirementId' })
  requirement: JobRequirementEntity;

  @OneToMany(
    () => ApplicationEntity,
    (applicationEntity) => applicationEntity.JobPost,
  )
  applications: ApplicationEntity[];

  @OneToMany(
    () => SaveJobEntity,
    (applicationEntity) => applicationEntity.jobPosting,
  )
  savedUsers: SaveJobEntity[];
}

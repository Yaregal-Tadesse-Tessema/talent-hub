/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import {
  EmploymentTypeEnums,
  JobPostingStatusEnums,
  WorkTypeEnums,
} from '../../constants';
import { JobRequirementEntity } from '../../job-requirement/persistance/job-requirement.entity';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';

@Entity({ name: 'job_postings' })
export class JobPostingEntity extends CommonEntity {
  @Column()
  title: string;
  @Column({ nullable: true })
  description: string;
  @Column()
  position: string;
  @Column({ nullable: true })
  applicationLink: string;
  @Column({ nullable: true })
  industry: string;
  @Column({ default: WorkTypeEnums.ON_SITE })
  workType: WorkTypeEnums;
  @Column({ default: 'Addis Abeba' })
  workCity: string;
  @Column({ nullable: true })
  workLocation: string;
  @Column({ default: EmploymentTypeEnums.FULL_TIME })
  employmentType: EmploymentTypeEnums;
  @Column({ nullable: true })
  salary: string;
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
  @Column({ default: JobPostingStatusEnums.DRAFT })
  status: JobPostingStatusEnums;
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
}

/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import {
  Entity,
  Column,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmploymentTypeEnums, JobPostingStatusEnums, WorkLocationEnums } from '../../constants';
import { JobRequirementEntity } from '../../job-requirement/persistance/job-requirement.entity';

@Entity({ name: 'job_postings' })
export class JobPostingEntity extends CommonEntity {
  @Column()
  title: string;
  @Column({ nullable: true })
  description: string;
  @Column()
  position: string;
  @Column({ default: WorkLocationEnums.ON_SITE })
  workLocation: WorkLocationEnums;
  @Column({ default:EmploymentTypeEnums.FULL_TIME })
  employmentType: EmploymentTypeEnums;
  @Column({ type:'decimal',nullable:true })
  salary: number;
  @Column()
  organizationId: string;
  @Column()
  requirementId: string;
  @Column("text",{array:true})
  skill: string[];
  @Column({default:JobPostingStatusEnums.DRAFT})
  status: JobPostingStatusEnums;
  @ManyToOne(
    () => JobRequirementEntity,
    (institutionEntity) => institutionEntity.jobPostings,
  )
  @JoinColumn({ name: 'requirementId' })
  requirement: JobRequirementEntity;
}

/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { JobPostingEntity } from '../../job/persistencies/job-posting.entity';

@Entity({ name: 'job_requirements' })
export class JobRequirementEntity extends CommonEntity {
  @Column()
  experienceLevel: string;
  @Column({ nullable: true })
  fieldOfStudy: string;
  @Column()
  educationLevel: string;
  @Column({ nullable: true })
  gpa: number;

  @OneToMany(
    () => JobPostingEntity,
    (institutionEntity) => institutionEntity.requirement,
  )
  jobPostings: JobPostingEntity[];
}

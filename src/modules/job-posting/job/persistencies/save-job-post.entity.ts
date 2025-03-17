/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JobPostingEntity } from '../../job/persistencies/job-posting.entity';
import { UserEntity } from 'src/modules/user/persistence/users.entity';

@Entity({ name: 'save_job_post' })
export class SaveJobEntity extends CommonEntity {
  @Column()
  jobPostId: string;
  @Column({ nullable: true })
  userId: string;
  @ManyToOne(
    () => JobPostingEntity,
    (institutionEntity) => institutionEntity.savedUsers,
  )
  @JoinColumn({name:'jobPostId'})
  jobPosting: JobPostingEntity;

  @ManyToOne(
    () => UserEntity,
    (userEntity) => userEntity.savedJobs,
  )
  @JoinColumn({name:'userId'})
  user: UserEntity;
}

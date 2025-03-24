/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { JobPostingEntity } from '../../job/persistencies/job-posting.entity';

@Entity({ name: 'save_job_post' })
@Unique(['jobPostId', 'userId'])
export class SaveJobEntity extends CommonEntity {
  @Column()
  jobPostId: string;
  @Column({})
  userId: string;
  @ManyToOne(
    () => JobPostingEntity,
    (institutionEntity) => institutionEntity.savedUsers,
  )
  @JoinColumn({ name: 'jobPostId' })
  jobPosting: JobPostingEntity;

  // @ManyToOne(
  //   () => UserEntity,
  //   (userEntity) => userEntity.savedJobs,
  // )
  // @JoinColumn({name:'userId'})
  // user: UserEntity;
}

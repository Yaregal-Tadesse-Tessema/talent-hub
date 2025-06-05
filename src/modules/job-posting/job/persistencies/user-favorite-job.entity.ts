/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { JobPostingEntity } from 'src/modules/job-posting/job/persistencies/job-posting.entity';

@Entity({ name: 'user_favorites_jobs' })
export class UserFavoriteJobEntity extends CommonEntity {
  @Column({name:"userId"})
  userId: string;
  @Column({ nullable: true,name:"jobPostId" })
  jobPostId: string;
  @ManyToOne(
    () => JobPostingEntity,
    (jobPostingEntity) => jobPostingEntity.favoriteJobs,
  )
  @JoinColumn({name:'job_post_id'})
  jobPost: JobPostingEntity;

    @ManyToOne(
    () => UserEntity,
    (jobPostingEntity) => jobPostingEntity.favoriteJobs,
  )
  @JoinColumn({name:'user_id'})
  user: UserEntity;
}

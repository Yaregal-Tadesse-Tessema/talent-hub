/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { JobPostingEntity } from 'src/modules/job-posting/job/persistencies/job-posting.entity';

@Entity({ name: 'user_favorites_jobs' })
@Unique(['userId', 'jobPostId'])
export class UserFavoriteJobEntity extends CommonEntity {
  @Column({})
  userId: string;
  @Column({ nullable: true })
  jobPostId: string;
  @ManyToOne(
    () => JobPostingEntity,
    (jobPostingEntity) => jobPostingEntity.favoriteJobs,
  )
  @JoinColumn({ name: 'jobPostId' })
  jobPost: JobPostingEntity;

  @ManyToOne(
    () => UserEntity,
    (jobPostingEntity) => jobPostingEntity.favoriteJobs,
  )
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}

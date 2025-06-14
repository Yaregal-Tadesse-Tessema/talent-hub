/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { JobPostingEntity } from 'src/modules/job-posting/job/persistencies/job-posting.entity';
import { UserEntity } from 'src/modules/user/persistence/users.entity';

@Entity({ name: 'invitations' })
@Unique(['userId', 'jobPostId'])
export class InvitationEntity extends CommonEntity {
  @Column({ nullable: true })
  userId: string;
  @Column()
  jobPostId: string;
  @Column()
  invitationLink: string;
  @ManyToOne(
    () => JobPostingEntity,
    (jobPostingEntity) => jobPostingEntity.applications,
  )
  @JoinColumn({ name: 'jobPostId' })
  JobPost: JobPostingEntity;
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.applications)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}

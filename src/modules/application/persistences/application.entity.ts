/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import {
  Entity,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { JobPostingEntity } from 'src/modules/job-posting/job/persistencies/job-posting.entity';

@Entity({ name: 'applications' })
@Unique(['userId', 'JobPostId'])
export class ApplicationEntity extends CommonEntity {
  @Column()
  userId: string;
  @Column()
  JobPostId: string;
  // @Column({ type: 'jsonb', nullable: true })
  // cv: FileDto;
  @Column({ nullable: true })
  coverLetter: string;
  @Column({ nullable: true, type: 'jsonb' })
  applicationInformation: any;
  @Column({ nullable: true, type: 'jsonb' })
  userInfo: any;
  @Column({ default: false })
  isViewed: boolean;
  @Column({ nullable: true })
  remark: string;
  @Column({ nullable: true })
  notification: string;
  @Column({ nullable: true })
  questionaryScore: number;
  @ManyToOne(
    () => JobPostingEntity,
    (jobPostingEntity) => jobPostingEntity.applications,
  )
  @JoinColumn({ name: 'JobPostId' })
  JobPost: JobPostingEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.applications)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}

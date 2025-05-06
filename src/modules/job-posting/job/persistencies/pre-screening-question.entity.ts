/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { JobPostingEntity } from './job-posting.entity';
@Entity('pre_screening_question')
export class PreScreeningQuestionEntity extends CommonEntity {
  @Column()
  jobPostId: string;
  @Column({})
  question: string;
  @Column({ nullable: true })
  type: string;
  @Column({ type: 'json', nullable: true })
  options: string[];
  @Column({ type: 'boolean', default: false })
  isKnockout: boolean;
  @Column({ type: 'boolean', default: false })
  isOptional: boolean;
  @Column({ type: 'int', nullable: true })
  weight: number;
  @Column({ type: 'boolean', nullable: true })
  booleanAnswer: boolean;
  @Column({ type: 'json', nullable: true })
  selectedOptions: string[];
  @Column({ type: 'json', nullable: true })
  essayAnswer: string;
  @Column({ type: 'float', nullable: true })
  score: number;

  @ManyToOne(
    () => JobPostingEntity,
    (institutionEntity) => institutionEntity.preScreeningQuestions,
  )
  @JoinColumn({ name: 'jobPostId' })
  jobPosting: JobPostingEntity;
}

/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, Index } from 'typeorm';
import {
  OpportunityCategoryEnum,
  OpportunityLocationTypeEnum,
  OpportunityStatusEnum,
} from '../constants';

@Entity({ name: 'opportunities' })
@Index(['category', 'isActive'])
@Index(['deadline'])
@Index(['isFeatured'])
export class OpportunityEntity extends CommonEntity {
  @Column({
    type: 'enum',
    enum: OpportunityCategoryEnum,
  })
  category: OpportunityCategoryEnum;

  @Column()
  title: string;

  @Column()
  organizer: string;

  @Column({ type: 'text' })
  summary: string; // Public view - max 60 words

  @Column({ type: 'text', nullable: true })
  eligibility: string; // Authenticated view

  @Column({ type: 'text', nullable: true })
  requirements: string; // Authenticated view

  @Column({ type: 'text', nullable: true })
  benefits: string; // Authenticated view

  @Column({ type: 'date' })
  deadline: Date; // Application deadline or event date

  @Column({ type: 'date', nullable: true })
  eventDate: Date; // For events like seminars, workshops, conferences

  @Column()
  officialLink: string; // URL

  @Column()
  location: string; // Local, Regional, or Global description

  @Column({
    type: 'enum',
    enum: OpportunityLocationTypeEnum,
    default: OpportunityLocationTypeEnum.LOCAL,
  })
  locationType: OpportunityLocationTypeEnum;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: 0 })
  viewCount: number;

  @Column({
    type: 'enum',
    enum: OpportunityStatusEnum,
    default: OpportunityStatusEnum.ACTIVE,
  })
  status: OpportunityStatusEnum;
}


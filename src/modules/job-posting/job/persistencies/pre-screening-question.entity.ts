/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity } from 'typeorm';
@Entity('pre_screening_question')
export class PreScreeningQuestionEntity extends CommonEntity {
  @Column()
  jobPostId: number;
  @Column()
  question: string;
  @Column({ type: 'enum', enum: ['multiple-choice', 'text', 'yes-no'] })
  type: string;
  @Column({ type: 'json', nullable: true }) 
  options: string[];
  @Column({ type: 'boolean', default: false }) 
  isKnockout: boolean;
  @Column({ type: 'int', nullable: true }) 
  weight: number;
  @Column({ type: "boolean", nullable: true })
  booleanAnswer: boolean; 
  @Column({ type: "json", nullable: true })
  selectedOptions: string[]; 
  @Column({ type: "json", nullable: true })
  essayAnswer: string; 
  @Column({ type: "float", nullable: true })
  score: number; 
}

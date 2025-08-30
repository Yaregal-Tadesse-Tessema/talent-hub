/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { JobPostingEntity } from './job-posting.entity';

@Entity('industries')
export class IndustryEntity extends CommonEntity {

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name: string;
  
  @Column({ type: 'text', nullable: true })
  description: string;

}

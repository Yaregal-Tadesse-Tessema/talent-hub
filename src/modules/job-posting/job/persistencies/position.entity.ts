/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import {
  Entity,
  Column,
} from 'typeorm';

@Entity('positions')
export class PositionEntity extends CommonEntity {

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name: string;
  @Column({ type: 'text', nullable: true })
  description: string;
}

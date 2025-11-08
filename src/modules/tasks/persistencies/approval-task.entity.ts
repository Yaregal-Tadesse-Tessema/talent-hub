/* eslint-disable prettier/prettier */
import { Column, Entity } from 'typeorm';
import { CommonEntity } from 'src/libs/Common/common-entity';
import { ApprovalStatus, ApprovalTaskType } from '../constants';

@Entity({ name: 'approval_tasks' })
export class ApprovalTaskEntity extends CommonEntity {
  @Column({ type: 'enum', enum: ApprovalTaskType })
  type: ApprovalTaskType;

  @Column({ type: 'varchar' })
  targetId: string;

  @Column({ type: 'enum', enum: ApprovalStatus })
  status: ApprovalStatus;
}



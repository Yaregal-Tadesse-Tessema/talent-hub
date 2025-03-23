/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
@Entity('sessions')
export class SessionEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Index()
  @Column({ nullable: true })
  accountId: string;
  @Column({ type: 'text', nullable: true })
  refreshToken: string;
  @Column({ nullable: true, type: 'text' })
  accessToken: string;
  @Column({ nullable: true })
  ipAddress: string;
  @Column({ nullable: true })
  userAgent: string;
}

/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sessions')
export class SessionEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Index()
  @Column()
  accountId: string;
  @Index()
  @Column({ type: 'text' })
  refreshToken: string;
  @Column({ nullable: true, type: 'text' })
  accessToken: string;
  @Column({ nullable: true })
  ipAddress: string;
  @Column({ nullable: true })
  userAgent: string;
}

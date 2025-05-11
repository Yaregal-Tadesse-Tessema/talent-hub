/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
@Entity('sessions')
// @EntityMeta('ses')
export class SessionEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Index()
  @Column({ name: 'account_id' })
  accountId: string;
  @Index()
  @Column({ name: 'refresh_token' })
  refreshToken: string;
  @Column()
  @Index()
  token: string;
  @Column({ nullable: true })
  ipAddress: string;
  @Column({ nullable: true, name: 'user_agent' })
  userAgent: string;
}

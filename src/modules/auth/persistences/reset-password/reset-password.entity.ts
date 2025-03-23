/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity } from 'typeorm';
@Entity('reset_password_tokens')
export class ResetPasswordTokenEntity extends CommonEntity {
  @Column({ type: 'text' })
  token: string;
  @Column()
  email: string;
  @Column({ name: 'account_id', type: 'uuid', nullable: true })
  accountId: string;
}

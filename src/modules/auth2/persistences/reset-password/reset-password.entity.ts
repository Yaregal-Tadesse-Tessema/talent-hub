import { CommonEntity } from '@libs/common/common.entity';
import { EntityMeta } from '@libs/common/decorators/entity-prefix';
import { Column, Entity } from 'typeorm';
@Entity('reset_password_tokens')
@EntityMeta('rept')
export class ResetPasswordTokenEntity extends CommonEntity {
  @Column({ type: 'text' })
  token: string;
  @Column()
  email: string;
  @Column({ name: 'account_id', type: 'uuid', nullable: true })
  accountId: string;
}

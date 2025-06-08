import { CommonEntity } from 'src/libs/Common/common-entity';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
import { TenantEntity } from 'src/modules/tenant/persistencies/tenant.entity';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('message')
export class MessageEntity extends CommonEntity {
  @Column({ nullable: true, name: 'sender_full_fame' })
  senderFullName: string;
  @Column({ nullable: true, name: 'receiver_full_name' })
  receiverFullName: string;
  @Column({ name: 'sender_employer_id', nullable: true })
  senderEmployerId: string;
  @Column({ nullable: true, name: 'sender_user_id' })
  senderUserId: string;
  @Column({ name: ' receiver_employer_id', nullable: true })
  receiverEmployerId: string;
  @Column({ nullable: true, name: ' receiver_user_id' })
  receiverUserId: string;
  @Column()
  content: string;
  @Column({ name: 'application_id', nullable: true })
  applicationId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Polymorphic sender
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'sender_user_id' })
  senderUser: UserEntity;

  @ManyToOne(() => TenantEntity, { nullable: true })
  @JoinColumn({ name: 'sender_employer_id' })
  senderEmployer: TenantEntity;

  // Polymorphic recipient
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'receiver_user_id' })
  recipientUser: UserEntity;

  @ManyToOne(() => TenantEntity, { nullable: true })
  @JoinColumn({ name: 'receiver_employer_id' })
  recipientEmployer: TenantEntity;

  @ManyToOne(
    () => ApplicationEntity,
    (messageEntity) => messageEntity.applicationMessages,
  )
  @JoinColumn({ name: 'application_id' })
  application: ApplicationEntity;
}

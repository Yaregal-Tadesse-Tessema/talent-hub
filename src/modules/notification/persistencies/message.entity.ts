/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
import { TenantEntity } from 'src/modules/tenant/persistencies/tenant.entity';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('message')
export class MessageEntity extends CommonEntity {
  @Column({ nullable: true })
  senderFullName: string;
  @Column({ nullable: true })
  receiverFullName: string;
  @Column({ nullable: true })
  senderEmployerId: string;
  @Column({ nullable: true })
  senderUserId: string;
  @Column({ nullable: true })
  receiverEmployerId: string;
  @Column({ nullable: true })
  receiverUserId: string;
  @Column()
  content: string;
  @Column({ nullable: true })
  applicationId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Polymorphic sender
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'senderUserId' })
  senderUser: UserEntity;

  @ManyToOne(() => TenantEntity, { nullable: true })
  @JoinColumn({ name: 'senderEmployerId' })
  senderEmployer: TenantEntity;

  // Polymorphic recipient
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'receiverUserId' })
  recipientUser: UserEntity;

  @ManyToOne(() => TenantEntity, { nullable: true })
  @JoinColumn({ name: 'receiverEmployerId' })
  recipientEmployer: TenantEntity;

  @ManyToOne(
    () => ApplicationEntity,
    (messageEntity) => messageEntity.applicationMessages,
    { onDelete: 'SET NULL' }
  )
  @JoinColumn({ name: 'applicationId' })
  application: ApplicationEntity;
}

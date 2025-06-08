/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import {
  DeliveryTypeEnums,
  NotificationTypeEnums,
} from '../usecase/email.command';
import { LookupEntity } from 'src/modules/tenant/persistencies/lookup.entity';

@Entity({ name: 'notification' })
export class NotificationEntity extends CommonEntity {
  @Column({ nullable: true })
  userId: string;
  @Column()
  senderId: string;
  @Column()
  type: NotificationTypeEnums;
  @Column({ default: DeliveryTypeEnums.INDIVIDUAL })
  notificationType: DeliveryTypeEnums;
  @Column()
  message: string;
  @Column()
  isRead: string;
  @Column()
  link: string;
  @ManyToOne(
    () => UserEntity,
    (userEntity) => userEntity.notifications,
  )
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => LookupEntity, (lookupEntity) => lookupEntity.notifications)
  @JoinColumn({ name: 'senderId' })
  sender: LookupEntity;
}

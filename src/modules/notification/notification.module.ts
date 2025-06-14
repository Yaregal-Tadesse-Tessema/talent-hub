/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { EmailController } from './controller/email.controller';
import { EmailService } from './usecase/email.usecase.command';
import { NotificationService } from './usecase/notificatoin/notification.usecase.service';
import { NotificationController } from './controller/notification.controller';
import { NotificationRepository } from './persistencies/notification.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './persistencies/notification.entity';
import { MessageEntity } from './persistencies/message.entity';
import { ApplicationEntity } from '../application/persistences/application.entity';
import { TenantEntity } from '../tenant/persistencies/tenant.entity';
import { UserEntity } from '../user/persistence/users.entity';
import { MessageService } from './usecase/message/message.usecase.service';
import { MessageRepository } from './persistencies/message.repository';
import { MessageController } from './controller/message.controller';
import { ChatGateway } from './usecase/socket-io/socket.usecase.command';
import { UserModule } from '../user/user.module';
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      MessageEntity,
      ApplicationEntity,
      TenantEntity,
      UserEntity,
    ]),
    UserModule,
  ],
  providers: [
    EmailService,
    NotificationRepository,
    NotificationService,
    MessageRepository,
    MessageService,

    ChatGateway,
  ],
  controllers: [EmailController, NotificationController, MessageController],
  exports: [EmailService],
})
export class NotificationModule {}

/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { EmailController } from './controller/email.controller';
import { EmailService } from './usecase/email.usecase.command';
@Global()
@Module({
  imports: [],
  providers: [EmailService],
  controllers: [EmailController],
})
export class NotificationModule {}

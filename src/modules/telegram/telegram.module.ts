/* eslint-disable prettier/prettier */
import { TelegrafModule } from 'nestjs-telegraf';
import { forwardRef, Module } from '@nestjs/common';
import { TelegramBotController } from './controller/telegram.controller';
import { TelegramBotService } from './usecase/telegram-boot-service';
import { UserModule } from '../user/user.module';
import { JobPostingModule } from '../job-posting/job-posting.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
    }),
    UserModule,
    forwardRef(() => JobPostingModule),
    ApplicationModule,
  ],

  providers: [TelegramBotService],
  controllers: [TelegramBotController],
  exports: [TelegramBotService],
})
export class TelegramModule {}

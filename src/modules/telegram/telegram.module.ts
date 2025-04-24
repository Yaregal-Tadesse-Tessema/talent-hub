/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';

import { TelegramBotController } from './controller/telegram.controller';
import { TelegramBotService } from './usecase/telegram-boot-service';

/* ── your feature modules ────────────────────────────────────────────── */
import { UserModule } from '../user/user.module';
import { JobPostingModule } from '../job-posting/job-posting.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [
    /* ⚠️  ONE (and only one) TelegrafModule.forRoot in the whole app  */
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN!,
      launchOptions: {
        /* Drop any lingering polling session on hot-reload / redeploy */
        dropPendingUpdates: true,
      },
    }),

    /* your domain modules */
    UserModule,
    forwardRef(() => JobPostingModule),
    ApplicationModule,
  ],

  providers: [TelegramBotService],
  controllers: [TelegramBotController],

  /* export the service so other modules can inject/send messages */
  exports: [TelegramBotService],
})
export class TelegramModule {}

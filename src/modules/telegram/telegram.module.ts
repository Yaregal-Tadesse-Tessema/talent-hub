/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';

/* ── your feature modules ────────────────────────────────────────────── */
import { JobPostingModule } from '../job-posting/job-posting.module';
import { ApplicationModule } from '../application/application.module';
import { UserModule } from '../user/user.module';
import { TelegramBotService } from './usecase/telegram-bot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/persistence/users.entity';
import { JobPostingEntity } from '../job-posting/job/persistencies/job-posting.entity';
import { ApplicationEntity } from '../application/persistences/application.entity';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, JobPostingEntity, ApplicationEntity]),
    FileModule,
  ],
  providers: [
    {
      provide: TelegramBotService,
      useClass: TelegramBotService,
    }
  ],
  controllers: [],
  exports: [TelegramBotService],
})
export class TelegramModule {}

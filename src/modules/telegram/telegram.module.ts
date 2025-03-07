/* eslint-disable prettier/prettier */
import { TelegrafModule } from 'nestjs-telegraf';
import { Module } from '@nestjs/common';
import { TelegramBotController } from './controller/telegram.controller';
import { TelegramBotService } from './usecase/telegram-boot-service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TelegrafModule.forRoot({ token: '7558399669:AAFLDxOlhwzalLY_YcWa_xLsLLLaPYnVZIU'}),UserModule],
  providers: [TelegramBotService],
  controllers: [TelegramBotController],
})
export class TelegramModule {}

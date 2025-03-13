/* eslint-disable prettier/prettier */
import { Controller, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { TelegramBotService } from '../usecase/telegram-boot-service';

@Controller('telegram-bot')
export class TelegramBotController {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly telegramBotService: TelegramBotService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Req() req: Request) {
    return await this.bot.handleUpdate(req.body);
  }
  @Post('send-message/:userId/:message/:jobId')
  async sendMessage(
    @Param('userId') userId: string,
    @Param('message') message: string,
    @Param('jobId') jobId: string,
  ) {
    return await this.telegramBotService.sendMessage(userId, message, jobId);
  }
}

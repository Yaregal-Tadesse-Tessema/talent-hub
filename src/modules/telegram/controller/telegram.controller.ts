/* eslint-disable prettier/prettier */
import { Controller, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { TelegramBotService } from '../usecase/telegram-bot.service';

@Controller('telegram-bot')
export class TelegramBotController {
  constructor(
    @InjectBot() private readonly bot: Telegraf, // 👈 inject Telegraf bot instance
    private readonly telegramBotService: TelegramBotService,
  ) {}

  // ✅ Webhook handler for Telegram (only needed if you're using webhooks, not polling)
  @Post('webhook')
  async handleWebhook(@Req() req: Request) {
    await this.bot.handleUpdate(req.body);
    return 'ok';
  }

  // ✅ Safer version using query or body instead of :message in URL
  @Post('send-message/:userId/:jobId')
  async sendMessage(
    @Param('userId') userId: string,
    @Param('jobId') jobId: string,
    @Req() req: Request,
  ) {
    const { message } = req.body;
    if (!message) {
      return { error: 'Message body is required' };
    }

    // return await this.telegramBotService.notifyNewJob(userId);
  }
}

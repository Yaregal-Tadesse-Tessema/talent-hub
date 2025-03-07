/* eslint-disable prettier/prettier */
import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Controller('telegram-bot')
export class TelegramBotController {
  constructor(@InjectBot() private readonly bot: Telegraf) {}

  @Post('webhook')
  async handleWebhook(@Req() req: Request) {
    await this.bot.handleUpdate(req.body);
  }
}

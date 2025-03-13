/* eslint-disable prettier/prettier */
import {Body, Controller, Post } from '@nestjs/common';
import { EmailService } from '../usecase/email.usecase.command';
import { SendEmail } from '../usecase/email.command';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';

@Controller('telegram-bot')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
  ) {}
@AllowAnonymous()
  @Post('send-email')
  async sendEmail(@Body() command: SendEmail) {
    // return await this.emailService.sendEmail(command);
  }
}

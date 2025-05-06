/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from '../usecase/email.usecase.command';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { ApiTags } from '@nestjs/swagger';
import { EmailCommand } from '../usecase/email.command';

@Controller('email')
@ApiTags('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @AllowAnonymous()
  @Post('send-email')
  async sendEmail() {
    const result = await this.emailService.basicEmail(
      {
        email: 'yayasoles@gmail.com',
        subject: 'New Leave Request',
        to: 'yayaatsoles@gmail.com',
        body: '2025-10-20',
        attachments: [
          {
            content: 'iiiiiiiiiii',
            filename: '222222',
            type: 'ttttttttt',
            disposition: 'attachment',
          },
        ],
      },
      () => {
        console.log('email sent to supervisor');
      },
      () => {
        console.log('email failed to send to supervisor');
      },
    );
  }
  @Post('send')
  @AllowAnonymous()
  async send(@Body() body: EmailCommand) {
    return await this.emailService.sendEmail(body.to, body.subject, body.html);
  }
}

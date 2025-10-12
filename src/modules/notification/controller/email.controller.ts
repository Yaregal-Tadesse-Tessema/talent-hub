/* eslint-disable prettier/prettier */
import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { EmailService } from '../usecase/email.usecase.command';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { EmailCommand } from '../usecase/email.command';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { memoryStorage } from 'multer';

@Controller('email')
@ApiTags('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) { }
  @AllowAnonymous()
  @Post('send-email')
  async sendEmail() {
    const result = await this.emailService.basicEmail(
      {
        email: 'talenthubinformation@gmail.com',
        subject: 'Emailing From Talenthub Information',
        to: 'talenthubinformation@gmail.com',
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
  @Post('send-grid')
  @AllowAnonymous()
  async sendGrid(@Body() body: EmailCommand) {
    return await this.emailService.sendGridEmail(
      body.to,
      body.subject,
      body.html,
      "Test"
    );
  }
  @Post('send-grid-calendor')
  @AllowAnonymous()
  async sendGridEmailCalendors(@Body() body: EmailCommand) {
    return await this.emailService.sendGridEmailCalenders(
      body.to,
      body.subject,
      body.html,
    );
  }
  @Post('send-email-with-attachment')
  @AllowAnonymous()
  @UseInterceptors(FilesInterceptor('files'))
  async sendEmailWithAttachment(
    @Body() body: EmailCommand,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const attachment = files.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype,
    }));
    return await this.emailService.sendEmailWithAttachment(
      body.to,
      body.subject,
      body.html,
      attachment
    );
  }
}

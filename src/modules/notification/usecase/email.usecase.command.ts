/* eslint-disable prettier/prettier */
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SendEmail } from './email.command';
import * as nodemailer from 'nodemailer';
@Injectable()
export class EmailService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EmailService.name);
  constructor(
    @Inject('EMAIL_SERVICE')
    private emailServiceClient: ClientProxy,
  ) {}
  private transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false, // true if port is 465, false for other ports
    auth: {
      user: 'YOUR_SMTP_USERNAME',
      pass: 'YOUR_SMTP_PASSWORD',
    },
  });
  async onApplicationBootstrap() {
    this.emailServiceClient
      .connect()
      .then(() => {
        this.logger.log('connected to Email service');
      })
      .catch((err) => {
        console.error('Error happened at email service', err);
      });
  }
  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    try {
      // Example: you could also pass HTML in the message object
      await this.transporter.sendMail({
        from: '"My App" <noreply@example.com>', // sender address
        to,
        subject,
        text,
        // html: '<b>Hello world?</b>', // For rich text
      });

      this.logger.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }
  async sendEmailf(dto: SendEmail) {
    this.emailServiceClient.emit('send-email', {
      ...dto,
      appKey: 'TALENT-HUB',
    });
    return {};
  }
}

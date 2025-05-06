/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { createEvent } from 'ics';
import type { MailDataRequired } from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';
import * as process from 'node:process';
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log('111111111111 : ', process.env.SENDGRID_API_KEY);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'yayasoles@gmail.com',
        pass: 'nakz vvvl goxz pxfu',
      },
    });
  }

  async sendGridEmail(
    to: string,
    subject: string,
    html: string,
    icsContent?: string,
  ): Promise<boolean> {
    console.log('2222222222222222222222222 : ');
    console.log('333333333333333333 : ', process.env.SENDGRID_API_KEY);
    const msg: sgMail.MailDataRequired = {
      to,
      from: 'yayasoles@gmail.com', // Must be a verified sender
      subject,
      html,
    };

    if (icsContent) {
      msg.attachments = [
        {
          content: Buffer.from(icsContent).toString('base64'),
          filename: 'invite.ics',
          type: 'text/calendar',
          disposition: 'attachment',
        },
      ];
    }

    try {
      await sgMail.send(msg);
      this.logger.log(`Email successfully sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending email:', error.response?.body || error);
      throw error;
    }
  }
}

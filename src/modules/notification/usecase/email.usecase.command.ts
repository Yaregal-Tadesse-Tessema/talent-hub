/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { createEvent } from 'ics';
import type { MailDataRequired } from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  private formatDate(date: Date): string {
    // Format YYYYMMDDTHHMMSSZ (UTC)
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  async basicEmail(data, resolve, reject) {
    console.log('try sending email');

    // 1. Generate calendar event using `ics`
    const { error, value: icsContent } = createEvent({
      title: data.subject,
      description: data.body,
      location: 'Addis Ababa',
      start: [2025, 5, 4, 10, 0], // [YYYY, M, D, H, M]
      end: [2025, 5, 4, 11, 0],
      status: 'CONFIRMED',
      organizer: { name: 'Garri', email: 'yayasoles@gmail.com' },
      attendees: [
        { name: 'Yaya A.', email: 'yayaatsoles@gmail.com', rsvp: true },
      ],
    });
    const calendarContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'PRODID:-//Garri Logistics//EN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@garrilogistics.com`,
      `DTSTAMP:${this.formatDate(new Date())}`,
      'DTSTART:20250504T100000Z',
      'DTEND:20250504T110000Z',
      `SUMMARY:${data.subject}`,
      `DESCRIPTION:${data.body}`,
      'LOCATION:Addis Ababa',
      'SEQUENCE:0',
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'ORGANIZER;CN=Garri Admin:mailto:yayasoles@gmail.com',
      'ATTENDEE;CN=Yaya A.;RSVP=TRUE:mailto:yayaatsoles@gmail.com',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    console.log(calendarContent);
    if (error) {
      this.logger.error('Error generating ICS:', error);
      return reject(error);
    }

    // 2. Create SendGrid message with ICS attached
    const msg: MailDataRequired = {
      from: 'yayasoles@gmail.com',
      to: 'yayaatsoles@gmail.com',
      subject: data.subject,
      html: `<p>${data.body}</p>`,
      text: data.body,
      attachments: [
        {
          content: Buffer.from(calendarContent).toString('base64'),
          filename: 'invite.ics',
          type: 'text/calendar',
          disposition: 'inline',
          content_id: 'calendar_invite', // ✅ Force snake_case
        } as any, // ✅ Bypass TypeScript typing
      ],
    };
    try {
      await SendGrid.send(msg);
      this.logger.log('Calendar invite sent');
      resolve(true);
    } catch (sendErr) {
      this.logger.error('Error sending calendar invite', sendErr);
      reject(sendErr);
    }
  }
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    icsContent?: string,
  ) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Talent Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    if (icsContent) {
      mailOptions.attachments = [
        {
          filename: 'invite.ics',
          content: icsContent,
          contentType: 'text/calendar',
        },
      ];
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.response}`);
      return info;
    } catch (err) {
      this.logger.error('Error sending email', err);
      throw err;
    }
  }
}

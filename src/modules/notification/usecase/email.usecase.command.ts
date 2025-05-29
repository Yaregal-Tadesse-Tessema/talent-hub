/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { createEvent } from 'ics';
import type { MailDataRequired } from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';
import * as process from 'node:process';
import ical, { ICalCalendarMethod } from 'ical-generator';
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
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
      from: `"Talent Hub" <yayasoles@gmail.com>`,
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
      return true;
    } catch (err) {
      this.logger.error('Error sending email', err);
      throw err;
    }
  }
  async sendGridEmail(
    to: string,
    subject: string,
    html: string,
    icsContent?: string,
  ): Promise<boolean> {
    try {
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
      await sgMail.send(msg);
      return true;
    } catch (error) {
      this.logger.error('Error sending email:', error.response?.body || error);
      throw error;
    }
  }
  async sendGridEmailCalendors(
    to: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    const icsContents: string[] = [];
    icsContents.push(
      this.buildIcs({
        attendeeEmail: to,
        description:
          'we will have a first phase Job Interview be prpare and be on time ',
        end: tomorrow,
        start: tomorrow,
        organizerEmail: 'yayasoles@gmail.com',
        organizerName: 'TalentHub',
        summary: 'Job Interview Appointment',
        uid: '57bf0aca-8e83-4e0e-9736-b37ac66f5810',
        location: 'Jemo  Medhanyalem Lebu Musica sefer',
      }),
    );
    icsContents.push(
      this.buildIcs({
        attendeeEmail: to,
        description:
          'we will have a first phase Job Interview be prpare and be on time ',
        end: tomorrow,
        start: tomorrow,
        organizerEmail: 'yayasoles@gmail.com',
        organizerName: 'TalentHub',
        summary: 'Job Interview Appointment',
        uid: '57bf0aca-9e83-4e0e-9736-b37ac66f5810',
        location: 'Jemo  Medhanyalem Lebu Musica sefer',
      }),
    );
    const result = await this.sendGridEmailCalendor(
      to,
      subject,
      html,
      icsContents,
    );
    return true;
  }
  async sendGridEmailCalendor(
    to: string,
    subject: string,
    html: string,
    icsContent?: string[],
  ): Promise<boolean> {
    try {
      const plain = html.replace(/<[^>]*>/g, '');
      /** ---------- 1. Build the core message ---------- */
      const msg: sgMail.MailDataRequired = {
        to,
        from: 'yayasoles@gmail.com', // verified sender
        subject,
        content: [
          // 👈 satisfies MailDataRequired
          { type: 'text/plain', value: plain },
          { type: 'text/html', value: html },
        ],
      };

      if (icsContent) {
        // 1️⃣ inline calendar part
        msg.content.push({
          type: 'text/calendar', // ⚠️ no semicolons here
          value: icsContent[0],
        });
        msg.content.push({
          type: 'text/calendar', // ⚠️ no semicolons here
          value: icsContent[1],
        });
        // 2️⃣ attachment (fallback for older clients)
        msg.attachments = [
          {
            content: Buffer.from(icsContent[0]).toString('base64'),
            filename: 'invite.ics',
            type: 'text/calendar', // ⚠️ no semicolons here
            disposition: 'attachment',
          },
        ];
        msg.attachments = [
          {
            content: Buffer.from(icsContent[1]).toString('base64'),
            filename: 'invite.ics',
            type: 'text/calendar', // ⚠️ no semicolons here
            disposition: 'attachment',
          },
        ];
        // 3️⃣ optional Outlook hint
        msg.headers = {
          'Content-Class': 'urn:content-classes:calendarmessage',
        };
      }

      /** ---------- 4. Fire away ---------- */
      await sgMail.send(msg);
      return true;
    } catch (error: any) {
      this.logger.error('Error sending email:', error?.response?.body || error);
      throw error;
    }
  }

  buildIcs(dto: {
    uid: string;
    start: Date;
    end: Date;
    summary: string;
    description: string;
    location?: string;
    organizerName: string;
    organizerEmail: string;
    attendeeEmail: string;
  }) {
    const cal = ical({
      name: 'Talent-Hub Schedules',
      method: ICalCalendarMethod.REQUEST,
    });
    cal.createEvent({
      id: dto.uid,
      start: dto.start,
      end: dto.end,
      summary: dto.summary,
      description: dto.description,
      location: dto.location,
      organizer: {
        name: dto.organizerName,
        email: dto.organizerEmail,
      },
      attendees: [
        {
          email: dto.attendeeEmail,
          name: dto.attendeeEmail.split('@')[0],
          rsvp: true,
        },
      ],
    });
    return cal.toString(); // already CRLF-safe
  }
}

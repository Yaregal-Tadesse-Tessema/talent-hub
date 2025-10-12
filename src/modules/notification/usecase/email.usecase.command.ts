/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { createEvent } from 'ics';
import * as nodemailer from 'nodemailer';
import * as Brevo from '@getbrevo/brevo';
import * as process from 'node:process';
import ical, { ICalCalendarMethod } from 'ical-generator';
import { ICalenderCommand } from 'src/modules/application/usecase/application.command';
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private client = new Brevo.TransactionalEmailsApi();
  private brevoConfigured = false;
  private smtpConfigured = false;

  constructor() {
    try {
      const apiKey = process.env.BREVO_API_KEY;
      if (apiKey) {
        this.client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
        this.brevoConfigured = true;
      }
    } catch (err) {
      this.logger.error('Failed to configure Brevo client', err as any);
      this.brevoConfigured = false;
    }
    try {
      const host = process.env.SMTP_HOST;
      const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      if (host && port && user && pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        this.smtpConfigured = true;
      }
    } catch (err) {
      this.logger.error('Failed to configure SMTP transporter', err as any);
      this.smtpConfigured = false;
    }
  }
  private formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  async basicEmail(data, resolve, reject) {
    console.log('try sending email');
    const { error, value: icsContent } = createEvent({
      title: data.subject,
      description: data.body,
      location: 'Addis Ababa',
      start: [2025, 5, 4, 10, 0], // [YYYY, M, D, H, M]
      end: [2025, 5, 4, 11, 0],
      status: 'CONFIRMED',
      organizer: { name: 'Talent Hub', email: 'talenthubinformation@gmail.com' },
      // attendees: [
      //   { name: 'Yaya A.', email: 'yayaatsoles@gmail.com', rsvp: true },
      // ],
    });
    const calendarContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'PRODID:-//Talent Hub//EN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@talenthubinformation.com`,
      `DTSTAMP:${this.formatDate(new Date())}`,
      'DTSTART:20250504T100000Z',
      'DTEND:20250504T110000Z',
      `SUMMARY:${data.subject}`,
      `DESCRIPTION:${data.body}`,
      'LOCATION:Addis Ababa',
      'SEQUENCE:0',
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'ORGANIZER;CN=TalentHub Admin:mailto:talenthubinformation@gmail.com',
      'ATTENDEE;CN=Yaya A.;RSVP=TRUE:mailto:talenthubinformation@gmail.com',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    console.log(calendarContent);
    if (error) {
      this.logger.error('Error generating ICS:', error);
      return reject(error);
    }

    // 2. Create SendGrid message with ICS attached
    const msg: Brevo.SendSmtpEmail = {
      sender: { name: 'Talent Hub', email: 'talenthubinformation@gmail.com' },
      to: [{ email: data.email, name: data?.name }],
      subject: data.subject,
      htmlContent: `<p>${data.body}</p>`,
      textContent: data.body,
      attachment: [
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
      if (!this.brevoConfigured) {
        throw new Error('BREVO_API_KEY is not configured');
      }
      await this.client.sendTransacEmail(msg);
      this.logger.log('Calendar invite sent');
      resolve(true);
    } catch (sendErr: any) {
      this.logger.error('Error sending calendar invite', sendErr);
      if (this.smtpConfigured) {
        try {
          await this.sendEmailWithAttachment(
            data.email,
            data.subject,
            `<p>${data.body}</p>`,
            [{ filename: 'invite.ics', content: calendarContent, contentType: 'text/calendar' }],
          );
          return resolve(true);
        } catch (smtpErr) {
          this.logger.error('SMTP fallback failed', smtpErr as any);
        }
      }
      reject(sendErr);
    }
  }
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    icsContent?: string,
  ) {
    const mailOptions: Brevo.SendSmtpEmail = {
      sender: { name: 'Talent Hub', email: 'talenthubinformation@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    if (icsContent) {
      mailOptions.attachment = [
        {
          name: 'invite.ics',
          content: icsContent,
          // contentType: 'text/calendar',
        },
      ];
    }

    try {
      if (!this.brevoConfigured) {
        throw new Error('BREVO_API_KEY is not configured');
      }
      const info = await this.client.sendTransacEmail(mailOptions);
      this.logger.log(`Email sent`);
      return true;
    } catch (err) {
      this.logger.error('Error sending email via Brevo', err as any);
      if (this.smtpConfigured) {
        try {
          await this.transporter.sendMail({
            from: 'Talent Hub <talenthubinformation@gmail.com>',
            to,
            subject,
            html,
          });
          return true;
        } catch (smtpErr) {
          this.logger.error('SMTP fallback failed', smtpErr as any);
        }
      }
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
      if (!to) {
        return null;
      }
      if (!this.brevoConfigured) {
        // Try configure once lazily
        const api_Key = process.env.BREVO_API_KEY;
        console.log(api_Key);
        if (api_Key) {
          this.client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, api_Key);
          this.brevoConfigured = true;
        }
      }
      const msg: Brevo.SendSmtpEmail = {
        to: [{ email: to }],
        sender: { name: 'Talent Hub', email: 'talenthubinformation@gmail.com' }, // Must be a verified sender
        subject,
        htmlContent: html,
      };

      // if (icsContent) {
      //   msg.attachment = [
      //     {
      //       content: Buffer.from(icsContent).toString('base64'),
      //       name: 'invite.ics',
      //     },
      //   ];
      // }
      if (!this.brevoConfigured) {
        throw new Error('BREVO_API_KEY is not configured');
      }
      await this.client.sendTransacEmail(msg);
      return true;
    } catch (error: any) {
      this.logger.error('Error sending email via Brevo:', error?.response?.body || error);
      // Fallback to SMTP if available
      if (this.smtpConfigured) {
        try {
          await this.transporter.sendMail({
            from: 'Talent Hub <talenthubinformation@gmail.com>',
            to,
            subject,
            html,
          });
          return true;
        } catch (smtpErr) {
          this.logger.error('SMTP fallback failed', smtpErr as any);
        }
      }
      throw error;
    }
  }

  async sendGridEmailCalenders(
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
        organizerEmail: 'talenthubinformation@gmail.com',
        organizerName: 'TalentHub',
        summary: 'Job Interview Appointment',
        uid: '57bf0aca-8e83-4e0e-9736-b37ac66f5810',
        location: 'Jemo  Medhanyalem Lebu Musica sefer',
      }),
    );
    icsContents.push(
      this.buildIcs({
        attendeeEmail: to,
        description: 'we will have aJob Interview be prepare and be on time ',
        end: tomorrow,
        start: tomorrow,
        organizerEmail: 'talenthubinformation@gmail.com',
        organizerName: 'TalentHub',
        summary: 'Job Interview Appointment',
        uid: '57bf0aca-9e83-4e0e-9736-b37ac66f5810',
        location: 'Jemo  Medhanyalem Lebu Musica sefer',
      }),
    );
    await this.sendGridEmailCalender(to, subject, html, icsContents);
    return true;
  }
  async sendGridEmailToEmployeesCalenders(
    to: string,
    subject: string,
    html: string,
    data: ICalenderCommand,
  ): Promise<boolean> {
    const start = new Date(data.start);
    const end = new Date(data.end);
    // tomorrow.setDate(tomorrow.getDate() + 3);
    const icsContents: string[] = [];
    icsContents.push(
      this.buildIcs({
        attendeeEmail: to,
        description: data.description,
        end: end,
        start: start,
        organizerEmail: data.organizerEmail,
        organizerName: data.organizerName,
        summary: data.summary,
        uid: data.uid,
        location: data.location,
      }),
    );
    icsContents.push(
      this.buildIcs({
        attendeeEmail: to,
        description: 'we will have aJob Interview be prepare and be on time ',
        end: end,
        start: start,
        organizerEmail: 'talenthubinformation@gmail.com',
        organizerName: 'TalentHub',
        summary: 'Job Interview Appointment',
        uid: '57bf0aca-9e83-4e0e-9736-b37ac66f5810',
        location: 'Bole Addis Abeba',
      }),
    );
    await this.sendGridEmailCalender(to, subject, html, icsContents);
    return true;
  }
  async sendGridEmailCalender(
    to: string,
    subject: string,
    html: string,
    icsContent?: string[],
  ): Promise<boolean> {
    try {
      const plain = html.replace(/<[^>]*>/g, '');
      /** ---------- 1. Build the core message ---------- */
      const msg: Brevo.SendSmtpEmail = {
        to: [{ email: to }],
        sender: { name: 'Talent Hub', email: 'talenthubinformation@gmail.com' }, // verified sender
        subject,
        htmlContent: html,
        textContent: plain,
      };

      if (icsContent) {
        // 1️⃣ inline calendar part
        msg.attachment.push({
          name: 'invite.ics', // ⚠️ no semicolons here
          content: icsContent[0],
        });
        msg.attachment.push({
          name: 'invite.ics', // ⚠️ no semicolons here
          content: icsContent[1],
        });
        // 2️⃣ attachment (fallback for older clients)
        msg.attachment = [
          {
            content: Buffer.from(icsContent[0]).toString('base64'),
            name: 'invite.ics',
            // type: 'text/calendar', // ⚠️ no semicolons here
            // disposition: 'attachment',
          },
        ];
        msg.attachment = [
          {
            content: Buffer.from(icsContent[1]).toString('base64'),
            name: 'invite.ics',
            // type: 'text/calendar', // ⚠️ no semicolons here
            // disposition: 'attachment',
          },
        ];
        // 3️⃣ optional Outlook hint
        msg.headers = {
          'Content-Class': 'urn:content-classes:calendarmessage',
        };
      }

      /** ---------- 4. Fire away ---------- */
      if (!this.brevoConfigured) {
        throw new Error('BREVO_API_KEY is not configured');
      }
      await this.client.sendTransacEmail(msg);
      return true;
    } catch (error: any) {
      this.logger.error('Error sending email via Brevo:', error?.response?.body || error);
      if (this.smtpConfigured) {
        try {
          await this.transporter.sendMail({
            from: 'Talent Hub <talenthubinformation@gmail.com>',
            to,
            subject,
            html,
          });
          return true;
        } catch (smtpErr) {
          this.logger.error('SMTP fallback failed', smtpErr as any);
        }
      }
      throw error;
    }
  }
  /**
   * Sends an email with an attachment using nodemailer.
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email body (HTML)
   * @param attachment Object with filename, content (Buffer or string), and contentType
   */
  async sendEmailWithAttachment(
    to: string,
    subject: string,
    html: string,
    attachment: { filename: string; content: Buffer | string; contentType: string }[]
  ): Promise<boolean> {
    if (!attachment) {
      return false;
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Talent Hub" <htalenthubet@gmail.com>`,
      to,
      subject,
      html,
      attachments: attachment
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email with attachment sent: ${info.response}`);
      return true;
    } catch (err) {
      this.logger.error('Error sending email with attachment', err);
      throw err;
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

/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { createEvent } from 'ics';
import type { MailDataRequired } from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';
import * as process from 'node:process';
import ical, { ICalCalendarMethod } from 'ical-generator';
import { ICalenderCommand } from 'src/modules/application/usecase/application.command';
import * as Brevo from '@getbrevo/brevo';
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
        user: 'talenthubinformation@gmail.com',
        pass: 'nakz vvvl goxz pxfu',
      },
    });
  }
  private formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  async basicEmailOld(data, resolve, reject) {
    console.log('try sending email');
    const { error, value: icsContent } = createEvent({
      title: data.subject,
      description: data.body,
      location: 'Addis Ababa',
      start: [2025, 5, 4, 10, 0], // [YYYY, M, D, H, M]
      end: [2025, 5, 4, 11, 0],
      status: 'CONFIRMED',
      organizer: { name: 'TalentHub', email: 'talenthubinformation@gmail.com' },
      attendees: [
        { name: 'Yaya A.', email: 'talenthubinformation@gmail.com', rsvp: true },
      ],
    });
    const calendarContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'PRODID:-//Talent  Hub//EN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${Date.now()}talenthubinformation@gmail.com`,
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
    const msg: MailDataRequired = {
      from: 'talenthubinformation@gmail.com',
      to: 'yayasoles@gmail.com',
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
  async basicEmail(data, resolve, reject) {
    const api_Key = process.env.BREVO_API_KEY;
    const client = new Brevo.TransactionalEmailsApi();
    client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, api_Key);
    console.log("try sending email");
    console.log(data);
    var msg: Brevo.SendSmtpEmail = {
        sender: { name: 'Talent Hub', email: 'talenthubinformation@gmail.com' },
        to: [{ email: data.email, name: data?.name }],
        subject: data.subject, // email subject
        htmlContent: data.body, // email content in HTML
    };

    if (data.attachments) {
        msg = {
            sender: { name: 'Talent Hub', email: 'talenthubinformation@gmail.com' },
            to: [{ email: data.email, name: data?.name }],
            subject: data.subject, // email subject
            htmlContent: data.body, // email content in HTML
            attachment: data.attachments.map((itemat, idxat) => {
              return {
                content: itemat.content,
                filename: itemat.filename,
                type: itemat.type,
                disposition: "attachment",
              };
            }),
        };
        console.log("message send with attachments");
    }
    client
        .sendTransacEmail(msg)
        .then((data) => {
            console.log('✅ Email sent:', data);
        })
        .catch((error) => {
            console.error('❌ Email failed:', error.response?.data || error);
        });
}
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    icsContent?: string,
  ) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Talent Hub" <talenthubinformation@gmail.com>`,
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
      if (!to) {
        return null;
      }
      // Initialize Brevo API client
      const api_Key = process.env.BREVO_API_KEY;
      const client = new Brevo.TransactionalEmailsApi();
      client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, api_Key);

      // Prepare email message
      const msg: Brevo.SendSmtpEmail = {
        sender: { name: 'Talent Hub', email: 'talenthubinformation@gmail.com' },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      };

      // Add ICS attachment if provided
      if (icsContent) {
        msg.attachment = [
          {
            content: Buffer.from(icsContent).toString('base64'),
            name: 'invite.ics',
          },
        ];
      }

      // Send email using Brevo
     const res = await client.sendTransacEmail(msg);
      this.logger.log(`Email sent to ${to} via Brevo`);
      return true;
    } catch (error) {
      this.logger.error('Error sending email via Brevo:', error.response?.data || error);
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
        location: 'Jemo  Medhanyalem Lebu Musica sefer',
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
      const msg: sgMail.MailDataRequired = {
        to,
        from: 'talenthubinformation@gmail.com', // verified sender
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
    if(!attachment) {
      return false;
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Talent Hub" <talenthubinformation@gmail.com>`,
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

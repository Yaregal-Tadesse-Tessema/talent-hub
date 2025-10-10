/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { createEvent } from 'ics';
import * as Brevo from '@getbrevo/brevo';


@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private  client = new Brevo.TransactionalEmailsApi();
  constructor() {
    const api_Key = process.env.BREVO_API_KEY;
    this.client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, api_Key);
  }

  async basicEmail(data, resolve, reject) {
    try {
      // Step 1: Generate ICS calendar event
      const { error, value } = createEvent({
        title: data.subject || 'Event',
        description: data.body || '',
        start: [2025, 5, 3, 10, 0],  // [YYYY, M, D, H, M]
        end: [2025, 5, 3, 11, 0],
        location: 'Addis Ababa',
        status: 'CONFIRMED',
        organizer: { name: 'Talent Hub', email: 'talenthubinformation@gmail.com' },
        attendees: [
          { name: 'User', email: data.email, rsvp: true }
        ],
      });

      if (error) {
        this.logger.error('ICS Generation Error:', error);
        return reject(error);
      }

      // Step 2: Create the message with icalEvent
      const msg: Brevo.SendSmtpEmail = {
        sender: { name: 'Talent Hub', email: 'talenthubinformation@gmail.com' },
        to: data.email,
        subject: data.subject || 'Meeting Invite',
        textContent: 'You have been invited to an event. Please find the invitation attached.',
        htmlContent: '<p>You have been invited to an event. Please find the invitation attached.</p>',
        // attachment: {
        //   name: 'invitation.ics',
        //   contentType: 'text/calendar',
        //   content: value,
        // },
      };

      // Step 3: Send via SendGrid
      await this.client.sendTransacEmail(msg);
      this.logger.log('Calendar invite sent');
      resolve(true);
    } catch (err) {
      this.logger.error('Failed to send calendar invite', err);
      reject(err);
    }
  }
}

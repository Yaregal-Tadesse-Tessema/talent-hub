/* eslint-disable prettier/prettier */

import { Injectable, Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { createEvent } from 'ics';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
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
        organizer: { name: 'Garri Logistics', email: 'admin@garrilogistics.com' },
        attendees: [
          { name: 'User', email: data.email, rsvp: true }
        ],
      });

      if (error) {
        this.logger.error('ICS Generation Error:', error);
        return reject(error);
      }

      // Step 2: Create the message with icalEvent
      const msg: any = {
        from: 'Garri <admin@garrilogistics.com>',
        to: data.email,
        subject: data.subject || 'Meeting Invite',
        text: 'You have been invited to an event. Please find the invitation attached.',
        html: '<p>You have been invited to an event. Please find the invitation attached.</p>',
        icalEvent: {
          filename: 'invitation.ics',
          method: 'REQUEST',
          content: value,
        },
      };

      // Step 3: Send via SendGrid
      await SendGrid.send(msg);
      this.logger.log('Calendar invite sent');
      resolve(true);
    } catch (err) {
      this.logger.error('Failed to send calendar invite', err);
      reject(err);
    }
  }
}

/* eslint-disable prettier/prettier */
// ics.service.ts
import { Injectable } from '@nestjs/common';
import ical, { ICalEventData } from 'ical-generator';

@Injectable()
export class IcsService {
  buildEvent(options: ICalEventData): string {
    const cal = ical({ name: 'Talent-Hub Schedules' });
    cal.createEvent(options);
    return cal.toString(); // raw text you’ll attach as .ics
  }
}

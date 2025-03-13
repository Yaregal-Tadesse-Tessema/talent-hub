/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SendEmail {
  @ApiProperty()
  @IsNotEmpty()
  to: string;
  @ApiProperty()
  sourceId: string;
  @ApiProperty()
  sourceName: string;
  @ApiProperty()
  @IsNotEmpty()
  subject: string;
  @ApiProperty()
  html?: string;
  @ApiProperty()
  text?: string;
  @ApiProperty()
  context?: {
    [name: string]: any;
  };
  @ApiProperty()
  templateName?: string;
  @ApiProperty()
  from?: string;
  @ApiProperty()
  replyTo?: string;
}

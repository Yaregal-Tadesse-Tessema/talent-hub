/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class CommonResponses {
  @ApiProperty()
  createdAt?: Date;
  @ApiProperty()
  updatedAt?: Date;
  @ApiProperty()
  deletedAt?: Date;
  @ApiProperty()
  createdBy?: string;
  @ApiProperty()
  updatedBy?: string;
  @ApiProperty()
  deletedBy?: string;
}

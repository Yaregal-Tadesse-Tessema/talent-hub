/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty()
  filename: string;
  @ApiProperty()
  path: string;
  @ApiProperty()
  originalname: string;
  @ApiProperty()
  mimetype: string;
  @ApiProperty()
  size?: number;
  @ApiProperty()
  bucketName?: string;
}

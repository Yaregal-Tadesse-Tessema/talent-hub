/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FileDto {
  @ApiProperty()
  @IsNotEmpty()
  filename: string;
  @ApiProperty()
  @IsNotEmpty()
  path: string;
  @ApiProperty()
  @IsNotEmpty()
  originalname: string;
  @ApiProperty()
  @IsNotEmpty()
  mimetype: string;
  @ApiProperty()
  @IsNotEmpty()
  size?: number;
  @ApiProperty()
  @IsNotEmpty()
  bucketName?: string;
}



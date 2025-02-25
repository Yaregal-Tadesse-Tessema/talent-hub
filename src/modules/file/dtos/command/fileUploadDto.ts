/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
export class UploadFileDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: string;
  @ApiProperty()
  @IsNotEmpty()
  fileCategory: string;
  @ApiProperty()
  category?: string;
  @ApiProperty()
  @IsNotEmpty()
  targetObjectId: string;

  @ApiProperty()
  @IsOptional()
  metaData?: object;
}

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

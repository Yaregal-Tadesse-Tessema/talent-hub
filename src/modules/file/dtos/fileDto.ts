import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetFileDto {
  @ApiProperty()
  @IsUUID()
  applicationId: string;
  @ApiProperty()
  category?: string;
}
export class DeleteFileDto {
  @ApiProperty()
  fileId: string;
  @ApiProperty()
  applicationRequiredDocumentId: string;
}

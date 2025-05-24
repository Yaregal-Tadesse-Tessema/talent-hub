/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
export class CreateExperienceCommand {
  id?: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  companyName: string;
  @ApiProperty()
  jobTitle: string;
  @ApiProperty()
  Industry: string;
  @ApiProperty()
  employmentType: string;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  endDate: Date;
  @ApiProperty()
  Attachment: FileDto;
}

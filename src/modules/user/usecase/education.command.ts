/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
export class CreateEducationCommand {
  id?: string;
  @ApiProperty()
  institutionName: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  typeOfDegree: string;
  @ApiProperty()
  fieldOfStudy: string;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  endDate: Date;
  @ApiProperty()
  gpa: number;
  @ApiProperty()
  Attachment: FileDto;
}


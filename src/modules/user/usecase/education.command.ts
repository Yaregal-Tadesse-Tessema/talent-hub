/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
export class CreateEducationCommand {
  @ApiProperty()
  institutionName: string;
  @ApiProperty()
  typeOfDegree: string;
  @ApiProperty()
  fieldOfStudy: string;
  @ApiProperty()
  major: string;
  @ApiProperty()
  minor: string;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  endDate: Date;
  @ApiProperty()
  gpa: number;
  @ApiProperty()
  Attachment: FileDto;
  @ApiProperty()
  courses: string[];
}

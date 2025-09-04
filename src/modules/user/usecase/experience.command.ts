/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
export class CreateExperienceCommand {
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
  skillsGained: string[];
  @ApiProperty()
  responsibility: string[];
  @ApiProperty()
  projectDescriptions: string[];
  @ApiProperty()
  Attachment: FileDto;
}
export class LocationCommand {
  @ApiProperty()
  country: string;
  @ApiProperty()
  state: string;
  @ApiProperty()
  city: string;
 
}

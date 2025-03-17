/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { ExperienceEntity } from '../persistence/experience.entity';
export class ExperienceResponse {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  userId?: string;
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
  static toResponse(dto: ExperienceEntity): ExperienceResponse {
    const entity = new ExperienceResponse();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.companyName = dto.companyName;
    entity.jobTitle = dto.jobTitle;
    entity.Industry = dto?.Industry;
    entity.employmentType = dto?.employmentType;
    entity.startDate = dto?.startDate;
    entity.endDate = dto?.endDate;
    entity.Attachment = dto?.Attachment;
    return entity;
  }
}

/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { ExperienceEntity } from '../persistence/experience.entity';
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
  static fromDto(dto: CreateExperienceCommand): ExperienceEntity {
    const entity = new ExperienceEntity();
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

  /**
   * Transfer list of DTO object to Entity  list
   *
   */
  static fromDtos(dto: CreateExperienceCommand[]): ExperienceEntity[] {
    return dto?.map((d) => CreateExperienceCommand.fromDto(d));
  }
}
export class UpdateExperienceCommand extends CreateExperienceCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

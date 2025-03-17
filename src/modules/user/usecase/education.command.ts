/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { EducationEntity } from '../persistence/education.entity';
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
  static fromDto(dto: CreateEducationCommand): EducationEntity {
    const entity = new EducationEntity();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.institutionName = dto.institutionName;
    entity.userId = dto.userId;
    entity.typeOfDegree = dto?.typeOfDegree;
    entity.fieldOfStudy = dto?.fieldOfStudy;
    entity.startDate = dto?.startDate;
    entity.endDate = dto?.endDate;
    entity.gpa = dto?.gpa;
    entity.Attachment = dto?.Attachment;
    return entity;
  }

  /**
   * Transfer list of DTO object to Entity  list
   *
   */
  static fromDtos(dto: CreateEducationCommand[]): EducationEntity[] {
    return dto?.map((d) => CreateEducationCommand.fromDto(d));
  }
}
export class UpdateEducationCommand extends CreateEducationCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

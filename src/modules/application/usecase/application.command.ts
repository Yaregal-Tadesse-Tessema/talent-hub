/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApplicationEntity } from '../persistences/application.entity';
export class CreateApplicationCommand {
  id?: string;
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  userId: string;
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  JobPostId: string;
  @ApiProperty()
  coverLetter: string;
  @ApiProperty()
  applicationInformation: any;

  static fromDto(dto: CreateApplicationCommand): ApplicationEntity {
    const entity = new ApplicationEntity();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.userId = dto.userId;
    entity.JobPostId = dto.JobPostId;
    entity.coverLetter = dto?.coverLetter;
    entity.applicationInformation = dto?.applicationInformation;
    return entity;
  }

  static fromDtos(dto: CreateApplicationCommand[]): ApplicationEntity[] {
    return dto?.map((d) => CreateApplicationCommand.fromDto(d));
  }
}
export class UpdateApplicationCommand extends CreateApplicationCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}


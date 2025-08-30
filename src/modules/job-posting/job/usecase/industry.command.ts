/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { IndustryEntity } from '../persistencies/industry.entity';

export class CreateIndustryCommand {
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  description: string;
  currentUser?: any;

  static fromDto(dto: CreateIndustryCommand): IndustryEntity {
    const entity = new IndustryEntity();
    if (!dto) {
      return null;
    }
    entity.name = dto.name;
    entity.id = dto?.id;
    entity.description = dto.description;
    return entity;
  }

  static fromDtos(dto: CreateIndustryCommand[]): IndustryEntity[] {
    return dto?.map((d) => CreateIndustryCommand.fromDto(d));
  }
}

export class UpdateIndustryCommand extends CreateIndustryCommand {
  @ApiProperty({ description: 'Industry ID' })
  @IsNotEmpty({ message: 'Industry ID is required' })
  @IsUUID('4', { message: 'Invalid industry ID format' })
  id: string;
}

export class DeleteIndustryCommand {
  @ApiProperty({ description: 'Industry ID' })
  @IsNotEmpty({ message: 'Industry ID is required' })
  @IsUUID('4', { message: 'Invalid industry ID format' })
  id: string;
}

/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID,  } from 'class-validator';
import { PositionEntity } from '../persistencies/position.entity';

export class CreatePositionCommand {
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  description: string;
  currentUser?: any;

  static fromDto(dto: CreatePositionCommand): PositionEntity {
    const entity = new PositionEntity();
    if (!dto) {
      return null;
    }
    entity.name = dto.name;
    entity.id = dto?.id;
    entity.description = dto.description;
    return entity;
  }

  static fromDtos(dto: CreatePositionCommand[]): PositionEntity[] {
    return dto?.map((d) => CreatePositionCommand.fromDto(d));
  }
}

export class UpdatePositionCommand extends CreatePositionCommand {
  @ApiProperty({ description: 'Position ID' })
  @IsNotEmpty({ message: 'Position ID is required' })
  @IsUUID('4', { message: 'Invalid position ID format' })
  id: string;
}

export class DeletePositionCommand {
  @ApiProperty({ description: 'Position ID' })
  @IsNotEmpty({ message: 'Position ID is required' })
  @IsUUID('4', { message: 'Invalid position ID format' })
  id: string;
}

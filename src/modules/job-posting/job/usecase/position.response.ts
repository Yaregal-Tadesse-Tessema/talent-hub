/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { PositionEntity } from '../persistencies/position.entity';

export class PositionResponse {
  @ApiProperty({ description: 'Unique identifier for the position' })
  id: string;

  @ApiProperty({ description: 'Name of the position' })
  name: string;

  @ApiProperty({ description: 'Description of the position' })
  description: string;

  @ApiProperty({ description: 'When the position was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the position was last updated' })
  updatedAt: Date;

  static toResponse(entity: PositionEntity): PositionResponse {
    const response = new PositionResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.description = entity.description;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }

  static toResponseList(entities: PositionEntity[]): PositionResponse[] {
    return entities.map((entity) => PositionResponse.toResponse(entity));
  }
}

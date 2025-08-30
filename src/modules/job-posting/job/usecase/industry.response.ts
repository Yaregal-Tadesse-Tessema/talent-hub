/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IndustryEntity } from '../persistencies/industry.entity';

export class IndustryResponse {
  @ApiProperty({ description: 'Industry ID' })
  id: string;

  @ApiProperty({ description: 'Industry name' })
  name: string;

  @ApiProperty({ description: 'Industry description', required: false })
  description?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  static toResponse(entity: IndustryEntity): IndustryResponse {
    if (!entity) return null;
    
    const response = new IndustryResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.description = entity.description;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    
    return response;
  }

  static toResponseList(entities: IndustryEntity[]): IndustryResponse[] {
    if (!entities || !Array.isArray(entities)) return [];
    return entities.map(entity => IndustryResponse.toResponse(entity));
  }
}

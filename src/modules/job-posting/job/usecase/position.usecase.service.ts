/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { In } from 'typeorm';
import { PositionRepository } from '../persistencies/position.repository';
import { CreatePositionCommand, UpdatePositionCommand, DeletePositionCommand } from './position.command';
import { PositionResponse } from './position.response';
import { PositionEntity } from '../persistencies/position.entity';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';

@Injectable()
export class PositionService {
  constructor(
    private readonly positionRepository: PositionRepository,
  ) { }

  async create(command: CreatePositionCommand): Promise<PositionResponse> {
    // Check if position with same name already exists (case-insensitive)
    // We'll use a simple query to check for duplicates
    const query = new CollectionQuery();
    query.where = [[
      { column: 'name', operator: '=', value: command.name.trim() }
    ]];

    const existingPositions = await this.positionRepository.findAll(query);
    if (existingPositions && existingPositions.items && existingPositions.items.length > 0) {
      throw new ConflictException(`Position with name '${command.name}' already exists`);
    }

    const position = new PositionEntity();
    position.name = command.name.trim();
    position.description = command.description?.trim();

    const createdPosition = await this.positionRepository.create(position);
    return PositionResponse.toResponse(createdPosition);
  }
  async createMany(commands: CreatePositionCommand[]): Promise<PositionResponse[]> {
    if (!Array.isArray(commands) || commands.length === 0) {
      throw new BadRequestException('No positions provided for bulk creation');
    }
    const positionsToCreate = commands.map(cmd => {
      const entity = new PositionEntity();
      entity.name = cmd.name.trim();
      entity.description = cmd.description?.trim();
      return entity;
    });
    const createdPositions: PositionResponse[] = [];
    for (const position of positionsToCreate) {
      const response = await this.create(position);
      createdPositions.push(response);
    }
    return createdPositions;
  }
  async findAll(
    query: CollectionQuery,
  ): Promise<DataResponseFormat<PositionResponse>> {
    const response = await this.positionRepository.findAllPublic(query);
    const d = new DataResponseFormat<PositionResponse>();
    d.items = response?.items?.map((item) =>
      PositionResponse.toResponse(item),
    );
    d.total = response?.total;
    return d;
  }

  async findOne(id: string): Promise<PositionResponse> {
    if (!id) {
      throw new BadRequestException('Position ID is required');
    }

    const position = await this.positionRepository.findOne(id);
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }
    return PositionResponse.toResponse(position);
  }

  async update(command: UpdatePositionCommand): Promise<PositionResponse> {
    const position = await this.positionRepository.findOne(command.id);
    if (!position) {
      throw new NotFoundException(`Position with ID ${command.id} not found`);
    }

    // Check if name is being changed and if it conflicts with existing names
    if (command.name.trim() !== position.name) {
      const query = new CollectionQuery();
      query.where = [[
        { column: 'name', operator: '=', value: command.name.trim() }
      ]];

      const existingPositions = await this.positionRepository.findAll(query);
      if (existingPositions && existingPositions.items && existingPositions.items.length > 0) {
        const existingPosition = existingPositions.items[0];
        if (existingPosition.id !== command.id) {
          throw new ConflictException(`Position with name '${command.name}' already exists`);
        }
      }
    }

    position.name = command.name.trim();
    position.description = command.description?.trim();

    const updatedPosition = await this.positionRepository.create(position);
    return PositionResponse.toResponse(updatedPosition);
  }

  async delete(command: DeletePositionCommand): Promise<{ success: boolean; message: string }> {
    const position = await this.positionRepository.findOne(command.id);
    if (!position) {
      throw new NotFoundException(`Position with ID ${command.id} not found`);
    }

    await this.positionRepository.softDelete(command.id);
    return {
      success: true,
      message: `Position '${position.name}' deleted successfully`
    };
  }

  async findActivePositions(): Promise<PositionResponse[]> {
    const query = new CollectionQuery();
    query.where = [[
      { column: 'deletedAt', operator: 'IsNull', value: '' }
    ]];
    query.orderBy = [
      { column: 'name', direction: 'ASC' }
    ];

    const positions = await this.positionRepository.findAll(query);
    if (positions && positions.items) {
      return PositionResponse.toResponseList(positions.items);
    }
    return [];
  }

  async findByIds(ids: string[]): Promise<PositionResponse[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    // Use the base repository's findAll method with a query
    const query = new CollectionQuery();
    query.where = [[
      { column: 'id', operator: 'In', value: ids }
    ]];

    const positions = await this.positionRepository.findAll(query);
    if (positions && positions.items) {
      return PositionResponse.toResponseList(positions.items);
    }
    return [];
  }

  async searchByName(name: string): Promise<PositionResponse[]> {
    if (!name || name.trim().length === 0) {
      return [];
    }

    // Use the base repository's findAll method with a query
    const query = new CollectionQuery();
    query.where = [[
      { column: 'name', operator: 'Like', value: `%${name.trim()}%` }
    ]];
    query.orderBy = [
      { column: 'name', direction: 'ASC' }
    ];

    const positions = await this.positionRepository.findAll(query);
    if (positions && positions.items) {
      return PositionResponse.toResponseList(positions.items);
    }
    return [];
  }
}

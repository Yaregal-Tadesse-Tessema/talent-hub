/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { IndustryRepository } from '../persistencies/industry.repository';
import { CreateIndustryCommand, UpdateIndustryCommand, DeleteIndustryCommand } from './industry.command';
import { IndustryResponse } from './industry.response';
import { IndustryEntity } from '../persistencies/industry.entity';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';

@Injectable()
export class IndustryService {
  constructor(
    private readonly industryRepository: IndustryRepository,
  ) {}

  async create(command: CreateIndustryCommand): Promise<IndustryResponse> {
    // Check if industry with same name already exists
    const query = new CollectionQuery();
    query.where = [[
      { column: 'name', operator: '=', value: command.name.trim() }
    ]];
    
    const existingIndustries = await this.industryRepository.findAll(query);
    if (existingIndustries && existingIndustries.items && existingIndustries.items.length > 0) {
      throw new ConflictException(`Industry with name '${command.name}' already exists`);
    }

    const industry = new IndustryEntity();
    industry.name = command.name.trim();
    industry.description = command.description?.trim();

    const createdIndustry = await this.industryRepository.create(industry);
    return IndustryResponse.toResponse(createdIndustry);
  }

  async findAll(query: CollectionQuery): Promise<IndustryResponse[]> {
    const industries = await this.industryRepository.findAll(query);
    if (industries && industries.items) {
      return IndustryResponse.toResponseList(industries.items);
    }
    return [];
  }

  async findOne(id: string): Promise<IndustryResponse> {
    if (!id) {
      throw new BadRequestException('Industry ID is required');
    }

    const industry = await this.industryRepository.findOne(id);
    if (!industry) {
      throw new NotFoundException(`Industry with ID ${id} not found`);
    }
    return IndustryResponse.toResponse(industry);
  }

  async update(command: UpdateIndustryCommand): Promise<IndustryResponse> {
    const industry = await this.industryRepository.findOne(command.id);
    if (!industry) {
      throw new NotFoundException(`Industry with ID ${command.id} not found`);
    }

    // Check if name is being changed and if it conflicts with existing names
    if (command.name.trim() !== industry.name) {
      const query = new CollectionQuery();
      query.where = [[
        { column: 'name', operator: '=', value: command.name.trim() }
      ]];
      
      const existingIndustries = await this.industryRepository.findAll(query);
      if (existingIndustries && existingIndustries.items && existingIndustries.items.length > 0) {
        const existingIndustry = existingIndustries.items[0];
        if (existingIndustry.id !== command.id) {
          throw new ConflictException(`Industry with name '${command.name}' already exists`);
        }
      }
    }

    industry.name = command.name.trim();
    industry.description = command.description?.trim();

    const updatedIndustry = await this.industryRepository.create(industry);
    return IndustryResponse.toResponse(updatedIndustry);
  }

  async delete(command: DeleteIndustryCommand): Promise<{ success: boolean; message: string }> {
    const industry = await this.industryRepository.findOne(command.id);
    if (!industry) {
      throw new NotFoundException(`Industry with ID ${command.id} not found`);
    }

    await this.industryRepository.softDelete(command.id);
    return { 
      success: true, 
      message: `Industry '${industry.name}' deleted successfully` 
    };
  }

  async findActiveIndustries(): Promise<IndustryResponse[]> {
    const query = new CollectionQuery();
    query.where = [[
      { column: 'deletedAt', operator: 'IsNull', value: '' }
    ]];
    query.orderBy = [
      { column: 'name', direction: 'ASC' }
    ];
    
    const industries = await this.industryRepository.findAll(query);
    if (industries && industries.items) {
      return IndustryResponse.toResponseList(industries.items);
    }
    return [];
  }

  async findByIds(ids: string[]): Promise<IndustryResponse[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    // Use the base repository's findAll method with a query
    const query = new CollectionQuery();
    query.where = [[
      { column: 'id', operator: 'In', value: ids }
    ]];
    
    const industries = await this.industryRepository.findAll(query);
    if (industries && industries.items) {
      return IndustryResponse.toResponseList(industries.items);
    }
    return [];
  }

  async searchByName(name: string): Promise<IndustryResponse[]> {
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
    
    const industries = await this.industryRepository.findAll(query);
    if (industries && industries.items) {
      return IndustryResponse.toResponseList(industries.items);
    }
    return [];
  }
}

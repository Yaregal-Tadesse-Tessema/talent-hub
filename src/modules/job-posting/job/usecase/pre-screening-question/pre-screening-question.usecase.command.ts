/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PreScreeningQuestionRepository } from '../../persistencies/pre-screening-question.repository';
import { DeepPartial } from 'typeorm';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { PreScreeningQuestionResponse } from './pre-screening-question.response';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
@Injectable()
export class PreScreeningQuestionService {
  constructor(
    private readonly preScreeningQuestionRepository: PreScreeningQuestionRepository,
  ) {}
  async create(itemData: DeepPartial<any>, req?: any): Promise<any> {
    if (req?.user?.organization) {
      itemData.organizationId = req.user.organization.id;
    }
    const item = this.preScreeningQuestionRepository.create(itemData);
    console.log(item);
    return item;
  }
  async findAll(query: CollectionQuery) {
    const result = await this.preScreeningQuestionRepository.findAll(query);
    const response: DataResponseFormat<PreScreeningQuestionResponse> = {
      items: result.items.map((item) =>
        PreScreeningQuestionResponse.toResponse(item),
      ),
      total: result.total,
    };
    return response;
  }
  async findOne(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<PreScreeningQuestionResponse> {
    const response = await this.preScreeningQuestionRepository.findOne(
      id,
      relations,
      withDeleted,
    );
    return PreScreeningQuestionResponse.toResponse(response);
  }
  async update(
    id: string,
    itemData: any,
  ): Promise<PreScreeningQuestionResponse> {
    await this.findOneOrFail(id);
    await this.preScreeningQuestionRepository.update(id, itemData);
    const res = await this.findOne(id);
    return res;
  }
  async softDelete(id: string): Promise<boolean> {
    await this.findOneOrFail(id);
    await this.preScreeningQuestionRepository.softDelete(id);
    return true;
  }
  async restore(id: string): Promise<boolean> {
    await this.findOneOrFailWithDeleted(id);
    await this.preScreeningQuestionRepository.restore(id);
    return true;
  }
  async findAllArchived(query: CollectionQuery) {
    if (!query.where) {
      query.where = [];
    }
    query.where.push([
      { column: 'deletedAt', value: '', operator: 'IsNotNull' },
    ]);
    const result = await this.preScreeningQuestionRepository.findAll(query);
    const response: DataResponseFormat<PreScreeningQuestionResponse> = {
      items: result.items.map((item) =>
        PreScreeningQuestionResponse.toResponse(item),
      ),
      total: result.total,
    };
    return response;
  }
  private async findOneOrFail(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<PreScreeningQuestionResponse> {
    const item = await this.findOne(id, relations, withDeleted);
    if (!item) {
      throw new NotFoundException(`not_found`);
    }
    return item;
  }
  private async findOneOrFailWithDeleted(
    id: any,
  ): Promise<PreScreeningQuestionResponse> {
    const item = await this.preScreeningQuestionRepository.findOne(
      id,
      [],
      true,
    );

    if (!item) {
      throw new NotFoundException(`not_found`);
    }
    return PreScreeningQuestionResponse.toResponse(item);
  }
  async getOneByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<PreScreeningQuestionResponse> {
    const response = await this.preScreeningQuestionRepository.getOneByCriteria(
      criteria,
      relations,
      withDeleted,
    );
    return PreScreeningQuestionResponse.toResponse(response);
  }
  async getManyByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<PreScreeningQuestionResponse[]> {
    const response =
      await this.preScreeningQuestionRepository.getManyByCriteria(
        criteria,
        relations,
        withDeleted,
      );
    return response.map((item) =>
      PreScreeningQuestionResponse.toResponse(item),
    );
  }
}

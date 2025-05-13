/* eslint-disable prettier/prettier */
import { Repository, DeepPartial, ObjectLiteral, DataSource } from 'typeorm';
import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';

import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CollectionQuery } from '../collection-query/query';
import { QueryConstructor } from '../collection-query/query-constructor';
import { REQUEST } from '@nestjs/core';
@Injectable({ scope: Scope.REQUEST })
export class BaseRepository<T extends ObjectLiteral> {
  constructor(
    private readonly repository: Repository<T>,
    @Inject(REQUEST) private request: Request,
  ) {}
  async create(itemData: DeepPartial<any>, req?: any): Promise<any> {
    const connection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = connection.getRepository(this.repository.target);
    if (req?.user?.organization) {
      itemData.organizationId = req.user.organization.id;
    }
    const item = repository.create(itemData);
    const res = (await this.repository.save(item)) as any;
    console.log(res);
    return item;
  }
  async findAll(query: CollectionQuery) {
    const connection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = connection.getRepository(this.repository.target);
    const dataQuery = QueryConstructor.constructQuery<T>(
      repository,
      query,
    );

    const response = new DataResponseFormat<T>();
    if (query.count) {
      response.total = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      response.total = total;
      response.items = result;
    }
    return response;
  }
  async findOne(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<T | undefined> {
    return await this.repository.findOne({
      where: { id },
      relations,
      withDeleted,
    });
  }
  async update(id: string, itemData: any): Promise<T | undefined> {
    await this.findOneOrFail(id);
    await this.repository.update(id, itemData);
    const res = await this.findOne(id);
    return res;
  }
  async softDelete(id: string): Promise<any> {
    const item = await this.findOneOrFail(id);
    await this.repository.softRemove(item);
    return true;
  }
  async restore(id: string): Promise<void> {
    await this.findOneOrFailWithDeleted(id);
    await this.repository.restore(id);
  }
  async findAllArchived(query: CollectionQuery) {
    if (!query.where) {
      query.where = [];
    }
    query.where.push([
      { column: 'deletedAt', value: '', operator: 'IsNotNull' },
    ]);

    const dataQuery = QueryConstructor.constructQuery<T>(
      this.repository,
      query,
    );

    dataQuery.withDeleted();

    const response = new DataResponseFormat<T>();
    if (query.count) {
      response.total = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      response.total = total;
      response.items = result;
    }
    return response;
  }
  private async findOneOrFail(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<T> {
    const item = await this.findOne(id, relations, withDeleted);
    if (!item) {
      throw new NotFoundException(`not_found`);
    }
    return item;
  }
  private async findOneOrFailWithDeleted(id: any): Promise<T> {
    const item = await this.repository.findOne({
      where: {
        id,
      },
      withDeleted: true,
    });

    if (!item) {
      throw new NotFoundException(`not_found`);
    }
    return item;
  }
  async getOneByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<T> {
    const response = await this.repository.findOne({
      where: criteria,
      relations,
      withDeleted,
    });
    return response;
  }
  async getManyByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<T[]> {
    const response = await this.repository.find({
      where: criteria,
      relations,
      withDeleted,
    });
    return response;
  }
}

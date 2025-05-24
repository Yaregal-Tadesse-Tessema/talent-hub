/* eslint-disable prettier/prettier */
import { Repository, DeepPartial, ObjectLiteral, DataSource } from 'typeorm';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CollectionQuery } from '../collection-query/query';
import { QueryConstructor } from '../collection-query/query-constructor';
import { REQUEST } from '@nestjs/core';
@Injectable()
export class BaseService<T extends ObjectLiteral> {
  constructor(
    private readonly repository: Repository<T>,
    @Inject(REQUEST) private readonly request: Request,
  ) {}
  async create(itemData: DeepPartial<any>, req?: any): Promise<any> {
    const privateCOnnection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = privateCOnnection.getRepository(this.repository.target);
    if (req?.user?.organization) {
      itemData.organizationId = req.user.organization.id;
    }
    const item = repository.create(itemData);
    const res = (await repository.insert(item)) as any;
    console.log(res);
    return item;
  }
  async save(itemData: DeepPartial<any>, req?: any): Promise<any> {
    const privateCOnnection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = privateCOnnection.getRepository(this.repository.target);
    if (req?.user?.organization) {
      itemData.organizationId = req.user.organization.id;
    }
    const item = repository.create(itemData);
    const res = (await repository.insert(item)) as any;
    console.log(res);
    return item;
  }
  async findAll(query: CollectionQuery) {
    const connection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = connection.getRepository(this.repository.target);
    const dataQuery = QueryConstructor.constructQuery<T>(repository, query);

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
    const privateCOnnection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = privateCOnnection.getRepository(this.repository.target);
    return await repository.findOne({
      where: { id },
      relations,
      withDeleted,
    });
  }
  async update(id: string, itemData: any): Promise<T | undefined> {
    const privateCOnnection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = privateCOnnection.getRepository(this.repository.target);
    await this.findOneOrFail(id);
    await repository.update(id, itemData);
    const res = await this.findOne(id);
    return res;
  }
  async softDelete(id: string): Promise<any> {
    const privateCOnnection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = privateCOnnection.getRepository(this.repository.target);
    const item = await this.findOneOrFail(id);
    await repository.softRemove(item);
    return true;
  }
  async restore(id: string): Promise<void> {
    const privateCOnnection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = privateCOnnection.getRepository(this.repository.target);
    await this.findOneOrFailWithDeleted(id);
    await repository.restore(id);
  }
  async findAllArchived(query: CollectionQuery) {
    const privateCOnnection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = privateCOnnection.getRepository(this.repository.target);
    if (!query.where) {
      query.where = [];
    }
    query.where.push([
      { column: 'deletedAt', value: '', operator: 'IsNotNull' },
    ]);

    const dataQuery = QueryConstructor.constructQuery<T>(repository, query);

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
    const item = await this.findOne({
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
    const privateCOnnection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = privateCOnnection.getRepository(this.repository.target);
    const response = await repository.findOne({
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
    const privateCOnnection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = privateCOnnection.getRepository(this.repository.target);
    const response = await repository.find({
      where: criteria,
      relations,
      withDeleted,
    });
    return response;
  }
}

/* eslint-disable prettier/prettier */
import { Repository, DeepPartial, ObjectLiteral, DataSource } from 'typeorm';
import {
  Inject,
  Injectable,
  NotFoundException,
  Req,
  Scope,
} from '@nestjs/common';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CollectionQuery } from '../collection-query/query';
import { QueryConstructor } from '../collection-query/query-constructor';
import { REQUEST } from '@nestjs/core';
@Injectable({ scope: Scope.REQUEST })
export class CommonCrudService<T extends ObjectLiteral> {
  constructor(
    private readonly repository: Repository<T>,
    @Inject(REQUEST) private request: Request,
  ) {
    console.log('🟢 Request inside CommonCrudService:', this.request);
  }
  async create(itemData: DeepPartial<any>, req?: any): Promise<any> {
    try {
      const connection: DataSource = await this.request['CONNECTION_KEY'];
      const repository = connection.getRepository(this.repository.target);
      if (req?.user?.organization) {
        itemData.organizationId = req.user.organization.id;
      }
      const item = repository.create(itemData);
      const res = (await repository.insert(item)) as any;
      return item;
    } catch (error) {
      console.log(error);
      throw error;
    }
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
    const connection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = connection.getRepository(this.repository.target);
    return await repository.findOne({
      where: { id },
      relations,
      withDeleted,
    });

    // return await this.repository.findOneBy({ id });
  }

  async update(id: string, itemData: any, req?: any): Promise<T | undefined> {
    const connection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = connection.getRepository(this.repository.target);
    await this.findOneOrFail(id);
    await repository.update(id, itemData);

    const res = await this.findOne(id);

    // this.auditingService.saveAudit({
    //   modelId: res?.id ?? null,
    //   modelName: this.repository.metadata.name,
    //   action: 'UPDATE',
    //   user: req?.user ?? null,
    //   oldPayload: existing,
    //   payload: {
    //     incoming: itemData,
    //     result: res,
    //   },
    //   userId: req?.user?.accountId ?? req?.user?.id ?? 'UNKNOWN_USER',
    // });

    return res;
  }

  async softDelete(id: string, @Req() req?: any): Promise<any> {
    const connection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = connection.getRepository(this.repository.target);
    const item = await this.findOneOrFail(id);
    const res = await repository.softRemove(item);

    // this.auditingService.saveAudit({
    //   modelId: id ?? null,
    //   modelName: this.repository.metadata.name,
    //   action: 'DELETE',
    //   user: req?.user,
    //   oldPayload: item,
    //   payload: {
    //     incoming: { id },
    //     result: res,
    //   },
    //   userId: req?.user?.accountId ?? req?.user?.id ?? 'UNKNOWN_USER',
    // });
    return true;
  }

  async restore(id: string): Promise<void> {
    const connection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = connection.getRepository(this.repository.target);
    await this.findOneOrFailWithDeleted(id);
    await repository.restore(id);
  }

  async findAllArchived(query: CollectionQuery) {
    const connection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = connection.getRepository(this.repository.target);
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
    const connection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = connection.getRepository(this.repository.target);
    const item = await repository.findOne({
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
  // newly added
  async getOneByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<T> {
    const connection: DataSource = await this.request['CONNECTION_KEY'];
    const repository = connection.getRepository(this.repository.target);
    const response = await repository.findOne({
      where: criteria,
      relations,
      withDeleted,
    });
    return response;
  }
}

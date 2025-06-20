/* eslint-disable prettier/prettier */
import { Repository, DeepPartial, ObjectLiteral, In } from 'typeorm';
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
    const tenantId = await this.request['TENANT_ID'];
    if (tenantId) {
      itemData.tenantId = tenantId;
    }
    if (req?.user?.organization) {
      itemData.organizationId = req.user.organization.id;
    }
    const res = (await this.repository.save(itemData)) as any;
    console.log(res);
    return res;
  }
  async findAll(query: CollectionQuery) {
    // if (
    //   !query?.orderBy ||
    //   query?.orderBy == null ||
    //   query?.orderBy.length == 0
    // ) {
    //   query.orderBy = [];
    //   query.orderBy.push({
    //     column: 'updatedAt',
    //     direction: 'DESC',
    //     nulls: 'NULLS LAST',
    //   });
    // }
    let dataQuery: any = null;
    const tenantId = await this.request['TENANT_ID'];
    if (!tenantId) {
      dataQuery = QueryConstructor.constructQuery<T>(this.repository, query);
    } else {
      query.where.push([
        {
          column: 'tenantId',
          operator: '=',
          value: tenantId,
        },
      ]);
      dataQuery = QueryConstructor.constructQuery<T>(this.repository, query);
    }
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
  async findAllPublic(query: CollectionQuery) {
    // if (
    //   !query?.orderBy ||
    //   query?.orderBy == null ||
    //   query?.orderBy.length == 0
    // ) {
    //   query.orderBy = [];
    //   query.orderBy.push({
    //     column: 'updatedAt',
    //     direction: 'DESC',
    //     nulls: 'NULLS LAST',
    //   });
    // }
    let dataQuery: any = null;
    dataQuery = QueryConstructor.constructQuery<T>(this.repository, query);
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
  async getCount(query: CollectionQuery) {
    let dataQuery: any = null;
    const tenantId = await this.request['TENANT_ID'];
    if (!tenantId) {
      dataQuery = QueryConstructor.constructQuery<T>(this.repository, query);
    } else {
      query.where.push([
        {
          column: 'tenantId',
          operator: '=',
          value: tenantId,
        },
      ]);
      dataQuery = QueryConstructor.constructQuery<T>(this.repository, query);
    }
    console.log(dataQuery.getSql());
    const response = await dataQuery.getCount();
    return response;
  }
  async findOne(
    id: string,
    relations = [],
    withDeleted = false,
  ): Promise<T | undefined> {
    const where: any = { id: id };
    return await this.repository.findOne({
      where,
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
  async updateMany(ids: string[], itemData: any): Promise<T[] | undefined> {
    const result = await this.repository.find({
      where: { id: In(ids) } as any,
    });
    if (result.length == 0) return null;
    await this.repository.update({ id: In(ids) } as any, itemData);
    return result;
  }
  async softDelete(id: string): Promise<any> {
    const item = await this.findOneOrFail(id);
    await this.repository.softRemove(item);
    return true;
  }
  async delete(id: string): Promise<any> {
    await this.findOneOrFail(id);
    await this.repository.delete(id);
    return true;
  }
  async restore(id: string): Promise<void> {
    await this.findOneOrFailWithDeleted(id);
    await this.repository.restore(id);
  }
  async findAllArchived(query: CollectionQuery) {
    const tenantId = await this.request['TENANT_ID'];
    // if (
    //   !query?.orderBy ||
    //   query?.orderBy == null ||
    //   query?.orderBy.length == 0
    // ) {
    //   query.orderBy = [];
    //   query.orderBy.push({
    //     column: 'updatedAt',
    //     direction: 'DESC',
    //     nulls: 'NULLS LAST',
    //   });
    // }
    if (!query.where) {
      query.where = [];
    }
    query.where.push([
      { column: 'deletedAt', value: '', operator: 'IsNotNull' },
    ]);

    let dataQuery = QueryConstructor.constructQuery<T>(this.repository, query);
    if (!tenantId) {
      dataQuery = QueryConstructor.constructQuery<T>(this.repository, query);
    } else {
      query.where.push([
        {
          column: 'tenantId',
          operator: '=',
          value: tenantId,
        },
      ]);
      dataQuery = QueryConstructor.constructQuery<T>(this.repository, query);
    }
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
  private async findOneOrFailWithDeleted(
    id: any,
    relations?: any[],
    withDeleted = false,
  ): Promise<T> {
    const item = await this.findOne(id, relations, withDeleted);

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
    const tenantId = await this.request['TENANT_ID'];
    let baseCriteria: any = {
      ...(criteria || {}), // if you have other criteria
    };
    if (Array.isArray(criteria)) {
      baseCriteria = criteria.map((cond) => ({
        ...cond,
        tenantId,
      }));
    } else {
      baseCriteria = {
        ...criteria,
        tenantId,
      };
    }
    if (tenantId) {
      baseCriteria.tenantId = tenantId;
    }
    const response = await this.repository.findOne({
      where: baseCriteria,
      relations,
      withDeleted,
    });
    return response;
  }
  async getManyByCriteria(
    criteria: any,
    relations = [],
    withDeleted = false,
  ): Promise<T[]> {
    const tenantId = await this.request['TENANT_ID'];
    let baseCriteria: any = {
      ...(criteria || {}), // if you have other criteria
    };
    if (Array.isArray(criteria)) {
      baseCriteria = criteria.map((cond) => ({
        ...cond,
        tenantId,
      }));
    } else {
      baseCriteria = {
        ...criteria,
        tenantId,
      };
    }
    if (tenantId) {
      baseCriteria.tenantId = tenantId;
    }

    const response = await this.repository.find({
      where: baseCriteria,
      relations,
      withDeleted,
    });
    return response;
  }
  async getManyByCriteriaWithOutToken(
    criteria: any,
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

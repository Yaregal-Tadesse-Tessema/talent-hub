/* eslint-disable prettier/prettier */
import { Repository, DeepPartial, ObjectLiteral } from 'typeorm';
import { Injectable, NotFoundException, Req } from '@nestjs/common';

// import { AuditingService } from '../auditing/services/auditing.service';
// import { CollectionQuery } from 'src/libs/collection-query/query';
// import { QueryConstructor } from 'src/libs/collection-query/query-constructor';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CollectionQuery } from '../collection-query/query';
import { QueryConstructor } from '../collection-query/query-constructor';
@Injectable()
export class CommonCrudService<T extends ObjectLiteral> {
  // @Inject(AuditingService)
  // private readonly auditingService: AuditingService;
  constructor(private readonly repository: Repository<T>) {}
  async create(itemData: DeepPartial<any>, req?: any): Promise<any> {
    try {
      if (req?.user?.organization) {
        itemData.organizationId = req.user.organization.id;
      }
      const item = this.repository.create(itemData);
      const res = (await this.repository.insert(item)) as any;
      return item;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(query: CollectionQuery) {
    const dataQuery = QueryConstructor.constructQuery<T>(
      this.repository,
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

    // return await this.repository.findOneBy({ id });
  }

  async update(id: string, itemData: any, req?: any): Promise<T | undefined> {
    const existing = await this.findOneOrFail(id);
    await this.repository.update(id, itemData);

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
    const item = await this.findOneOrFail(id);
    const res = await this.repository.softRemove(item);

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
  // newly added
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
}

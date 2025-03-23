import { CollectionQuery } from '@libs/collection-query/collection-query';
import { DataResponseFormat } from '@libs/response-format/data-response-format';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TenantResponse } from './tenant.response';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantEntity } from 'modules/tenant-database/persistance/tenat.entity';
import { DataSource, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { TenantDatabaseService } from '../tenant-database.service';
import * as dotenv from 'dotenv';
import { QueryConstructor } from '@libs/collection-query/query-constructor';
dotenv.config({ path: '.env' });

@Injectable()
export class TenantQuery {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
    @Inject(REQUEST) private request: Request,
    private tenantDatabaseService:TenantDatabaseService
  ) {}
  async getTenant(
    id: number,
    relations = [],
    withDeleted = false,
  ): Promise<TenantResponse> {
    const connection: DataSource = await this.tenantDatabaseService.getPublicConnection()
    const tenantRepository=connection.getRepository(TenantEntity)
    const Tenant = await tenantRepository.findOne({
      where: { id: id },
      relations,
      withDeleted,
    });
    if (!Tenant) {
      throw new NotFoundException('Tenant Up not found');
    }
    return TenantResponse.toResponse(Tenant);
  }
  
  async getTenants(query: CollectionQuery) // query: CollectionQuery,
  : Promise<DataResponseFormat<TenantResponse>> {
    console.log(process.env.PUBLIC_DATABASE_SCHEMA)
    const connection: DataSource = await this.tenantDatabaseService.getPublicConnection()
    const tenantRepository=connection.getRepository(TenantEntity)
    // console.log('this is logged for debugging reason on production')
    // const res = repo.find();
    // return res;
    const dataQuery = QueryConstructor.constructQuery(tenantRepository,query)
    const d = new DataResponseFormat<TenantResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((item)=>TenantResponse.toResponse(item));
      d.count = total;
    }
    return d;
  }
}

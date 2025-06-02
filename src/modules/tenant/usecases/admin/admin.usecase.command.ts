/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminUserRepository } from '../../persistencies/admin.repository';
import { CreateAdminCommand } from './admin.command';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { AdminUSerResponse } from './admin.response';
@Injectable()
export class AdminUserService {
  constructor(private readonly adminUserRepository: AdminUserRepository) {}

  async create(itemData: CreateAdminCommand): Promise<any> {
    const res = (await this.adminUserRepository.create(itemData)) as any;
    return res;
  }
  async findAll(query: CollectionQuery) {
    const response = await this.adminUserRepository.findAll(query);
    return response;
  }
  async findOne(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<AdminUSerResponse> {
    return await this.adminUserRepository.findOne(id, relations, withDeleted);
  }
  async update(id: string, itemData: any): Promise<AdminUSerResponse> {
    await this.findOneOrFail(id);
    await this.adminUserRepository.update(id, itemData);
    const res = await this.findOne(id);
    return res;
  }
  async softDelete(id: string): Promise<boolean> {
    await this.findOneOrFail(id);
    await this.adminUserRepository.softDelete(id);
    return true;
  }
  async restore(id: string): Promise<boolean> {
    await this.findOneOrFailWithDeleted(id);
    await this.adminUserRepository.restore(id);
    return true;
  }
  async findAllArchived(query: CollectionQuery) {
    if (!query.where) {
      query.where = [];
    }
    query.where.push([
      { column: 'deletedAt', value: '', operator: 'IsNotNull' },
    ]);
    const response = await this.adminUserRepository.findAll(query);
    return response;
  }
  private async findOneOrFail(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<AdminUSerResponse> {
    const item = await this.findOne(id, relations, withDeleted);
    if (!item) {
      throw new NotFoundException(`not_found`);
    }
    return item;
  }
  private async findOneOrFailWithDeleted(id: any): Promise<AdminUSerResponse> {
    const item = await this.adminUserRepository.findOne(id, [], true);

    if (!item) {
      throw new NotFoundException(`not_found`);
    }
    return item;
  }
  async getOneByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<AdminUSerResponse> {
    const response = await this.adminUserRepository.getOneByCriteria(
      criteria,
      relations,
      withDeleted,
    );
    return response;
  }
  async getManyByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<AdminUSerResponse[]> {
    const response = await this.adminUserRepository.getManyByCriteria(
      criteria,
      relations,
      withDeleted,
    );
    return response.map((item) => AdminUSerResponse.toResponse(item));
  }
}
/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { UserTenantRepository } from '../../persistencies/user-tenant.repository';
import { CreateUserTenantCommand, UpdateUserTenantCommand } from './user-tenant.command';
import { UserTenantResponse } from './user-tenant.response';

@Injectable()
export class UserTenantService {
  constructor(
    private readonly userTenantRepository: UserTenantRepository,
  ) {}

  async getAll(query: CollectionQuery) {
    return await this.userTenantRepository.findAll(query);
  }
  async getById(id: string) {
    return await this.userTenantRepository.findOne(id);
  }
  async createUserTenant(command: CreateUserTenantCommand) {
    const userTenant =
      await this.userTenantRepository.create(command);
    return UserTenantResponse.toResponse(userTenant)
  }
  async updateUserTenant(command: UpdateUserTenantCommand) {
    const lookup = await this.userTenantRepository.findOne(
      command.id,
    );
    if (!lookup) throw new NotFoundException('User tenant does not exist');
    return await this.userTenantRepository.update(
      command.id,
      command,
    );
  }
  async archive(id: string) {
    const lookup = await this.userTenantRepository.findOne(id);
    if (!lookup) throw new NotFoundException('User tenant does not exist');
    const result = await this.userTenantRepository.softDelete(id);
    return result.affected > 0 ? true : false;
  }
}

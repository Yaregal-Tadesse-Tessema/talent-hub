/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { LookupEntity } from '../persistances/lookup.entity';
import { TenantDatabaseService } from '../tenant-database.service';
@Injectable()
export class LookupService {
  constructor(private readonly tenantDatabaseService: TenantDatabaseService) {}
  async getAll() {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(LookupEntity);
    return await tenantRepository.find();
  }
  async getById(id: string) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(LookupEntity);
    return await tenantRepository.find({ where: { id: id } });
  }
}

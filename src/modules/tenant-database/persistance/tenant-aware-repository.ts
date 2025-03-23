import { Injectable, Scope } from '@nestjs/common';
import { TenantDatabaseService } from '../usecase/tenant-database.service';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class TenantAwareRepository<T> {
  constructor(
    private readonly tenantService: TenantDatabaseService,
    // private readonly entity:{new ():T},
    // private readonly schema:any,
  ) {}
  async getRepository(
    entity: { new (): T },
    schema: string,
  ): Promise<Repository<T>> {
    const connection = await this.tenantService.getConnection(schema);
    return connection.getRepository(entity);
  }
}

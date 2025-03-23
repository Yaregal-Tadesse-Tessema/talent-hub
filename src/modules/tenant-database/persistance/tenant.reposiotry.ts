import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { TenantEntity } from './tenat.entity';
import { TenantBaseRepository } from '@libs/common/repositories/tenat.base.repository';

@Injectable()
export class TenantRepository extends TenantBaseRepository<TenantEntity> {
  constructor(
    @InjectRepository(TenantEntity)
    repository: Repository<TenantEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

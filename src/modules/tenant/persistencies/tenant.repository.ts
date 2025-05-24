/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { TenantEntity } from './tenant.entity';
@Injectable()
export class TenantRepository extends BaseRepository<TenantEntity> {
  constructor(
    @InjectRepository(TenantEntity)
    repository: Repository<TenantEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

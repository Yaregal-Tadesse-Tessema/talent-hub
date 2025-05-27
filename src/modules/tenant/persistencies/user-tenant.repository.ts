/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { UserTenantEntity } from './user-tenant.entity';
@Injectable()
export class UserTenantRepository extends BaseRepository<UserTenantEntity> {
  constructor(
    @InjectRepository(UserTenantEntity)
    repository: Repository<UserTenantEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { TenantFavoriteUserEntity } from './tenant-favorite-user.entity';
@Injectable()
export class TenantFavoriteUserRepository extends BaseRepository<TenantFavoriteUserEntity> {
  constructor(
    @InjectRepository(TenantFavoriteUserEntity)
    repository: Repository<TenantFavoriteUserEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

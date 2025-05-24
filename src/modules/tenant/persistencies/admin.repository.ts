/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { AdminUserEntity } from './admin.entity';
@Injectable()
export class AdminUserRepository extends BaseRepository<AdminUserEntity> {
  constructor(
    @InjectRepository(AdminUserEntity)
    repository: Repository<AdminUserEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

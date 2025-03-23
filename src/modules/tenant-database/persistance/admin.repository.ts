import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@libs/common/repositories/base.repository';
import { REQUEST } from '@nestjs/core';
import { AdminUserEntity } from './admin-user.entity';

@Injectable()
export class AdminRepository extends BaseRepository<AdminUserEntity> {
  constructor(
    @InjectRepository(AdminUserEntity)
    repository: Repository<AdminUserEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

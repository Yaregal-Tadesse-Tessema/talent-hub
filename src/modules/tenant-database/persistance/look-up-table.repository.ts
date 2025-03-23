import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@libs/common/repositories/base.repository';
import { REQUEST } from '@nestjs/core';
import { LookUpEntity } from './look-up-table.entity';

@Injectable()
export class LookUpRepository extends BaseRepository<LookUpEntity> {
  constructor(
    @InjectRepository(LookUpEntity)
    repository: Repository<LookUpEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

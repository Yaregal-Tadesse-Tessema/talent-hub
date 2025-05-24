/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { LookupEntity } from './lookup.entity';
@Injectable()
export class LookupRepository extends BaseRepository<LookupEntity> {
  constructor(
    @InjectRepository(LookupEntity)
    repository: Repository<LookupEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

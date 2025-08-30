/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { IndustryEntity } from './industry.entity';

@Injectable()
export class IndustryRepository extends BaseRepository<IndustryEntity> {
  constructor(
    @InjectRepository(IndustryEntity)
    repository: Repository<IndustryEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }

  // Custom methods will be implemented in the service using the base repository methods
}

/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { OpportunityEntity } from './opportunity.entity';

@Injectable()
export class OpportunityRepository extends BaseRepository<OpportunityEntity> {
  constructor(
    @InjectRepository(OpportunityEntity)
    repository: Repository<OpportunityEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}


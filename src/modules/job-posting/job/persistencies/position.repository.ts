/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { PositionEntity } from './position.entity';

@Injectable()
export class PositionRepository extends BaseRepository<PositionEntity> {
  constructor(
    @InjectRepository(PositionEntity)
    repository: Repository<PositionEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }

  // Custom methods will be implemented in the service using the base repository methods
}

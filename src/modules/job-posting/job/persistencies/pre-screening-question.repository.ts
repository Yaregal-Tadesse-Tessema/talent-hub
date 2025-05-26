/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { PreScreeningQuestionEntity } from './pre-screening-question.entity';
@Injectable()
export class PreScreeningQuestionRepository extends BaseRepository<PreScreeningQuestionEntity> {
  constructor(
    @InjectRepository(PreScreeningQuestionEntity)
    repository: Repository<PreScreeningQuestionEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

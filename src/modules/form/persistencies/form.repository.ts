/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { FormEntity } from './form.entity';

@Injectable()
export class FormRepository extends BaseRepository<FormEntity> {
  constructor(
    @InjectRepository(FormEntity)
    repository: Repository<FormEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}


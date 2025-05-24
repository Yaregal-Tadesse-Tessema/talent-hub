/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { ApplicationEntity } from './application.entity';
@Injectable()
export class ApplicationRepository extends BaseRepository<ApplicationEntity> {
  constructor(
    @InjectRepository(ApplicationEntity)
    repository: Repository<ApplicationEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

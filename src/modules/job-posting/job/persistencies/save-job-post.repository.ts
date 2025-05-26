/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { SaveJobEntity } from './save-job-post.entity';
@Injectable()
export class SaveJobPostingRepository extends BaseRepository<SaveJobEntity> {
  constructor(
    @InjectRepository(SaveJobEntity)
    repository: Repository<SaveJobEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

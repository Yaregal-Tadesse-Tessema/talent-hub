/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { JobPostingEntity } from './job-posting.entity';
@Injectable()
export class JobPostingRepository extends BaseRepository<JobPostingEntity> {
  constructor(
    @InjectRepository(JobPostingEntity)
    repository: Repository<JobPostingEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { TestimonialsEntity } from './testimonials.entity';
@Injectable()
export class TestimonialsRepository extends BaseRepository<TestimonialsEntity> {
  constructor(
    @InjectRepository(TestimonialsEntity)
    repository: Repository<TestimonialsEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

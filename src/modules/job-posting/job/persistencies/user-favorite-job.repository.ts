/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { UserFavoriteJobEntity } from './user-favorite-job.entity';
@Injectable()
export class UserFavoriteJobRepository extends BaseRepository<UserFavoriteJobEntity> {
  constructor(
    @InjectRepository(UserFavoriteJobEntity)
    repository: Repository<UserFavoriteJobEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

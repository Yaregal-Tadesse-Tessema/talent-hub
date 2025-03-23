import { BaseRepository } from '@libs/common/repositories/base.repository';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResetPasswordTokenEntity } from './reset-password.entity';
import { REQUEST } from '@nestjs/core';
@Injectable()
export class ResetPasswordTokenRepository extends BaseRepository<ResetPasswordTokenEntity> {
  constructor(
    @InjectRepository(ResetPasswordTokenEntity)
    repository: Repository<ResetPasswordTokenEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { PasswordResetEntity } from './password-reset.entity';
@Injectable()
export class PasswordResetRepository extends BaseRepository<PasswordResetEntity> {
  constructor(
    @InjectRepository(PasswordResetEntity)
    repository: Repository<PasswordResetEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

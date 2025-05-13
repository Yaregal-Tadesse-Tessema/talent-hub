/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from './session.entity';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
@Injectable()
export class SessionRepository extends BaseRepository<SessionEntity> {
  constructor(
    @InjectRepository(SessionEntity)
    sessionRepository: Repository<SessionEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(sessionRepository, request);
  }
}

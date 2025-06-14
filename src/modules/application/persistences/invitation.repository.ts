/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { InvitationEntity } from './invitation.entity';
@Injectable()
export class InvitationRepository extends BaseRepository<InvitationEntity> {
  constructor(
    @InjectRepository(InvitationEntity)
    repository: Repository<InvitationEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

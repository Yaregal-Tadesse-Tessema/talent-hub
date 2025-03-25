/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { SaveJobEntity } from '../persistencies/save-job-post.entity';
import { REQUEST } from '@nestjs/core';
@Injectable()
export class SavedJobsService extends CommonCrudService<SaveJobEntity> {
  constructor(
    @InjectRepository(SaveJobEntity)
    private readonly saveJobEntity: Repository<SaveJobEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(saveJobEntity, request);
  }
}

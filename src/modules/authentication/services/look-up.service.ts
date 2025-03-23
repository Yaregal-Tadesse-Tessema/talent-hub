/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { LookUpEntity } from '../persistances/lookup.entity';
@Injectable()
export class LookupService extends CommonCrudService<LookUpEntity> {
  constructor(
    @InjectRepository(LookUpEntity)
    private readonly lookupRepository: Repository<LookUpEntity>,
  ) {
    super(lookupRepository);
  }
}

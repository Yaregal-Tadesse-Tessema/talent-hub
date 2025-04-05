/* eslint-disable prettier/prettier */
import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';

import { REQUEST } from '@nestjs/core';
import { JobRequirementEntity } from './job-requirement.entity';
@Injectable()
export class JobRequirementRepository extends CommonCrudService<JobRequirementEntity> {
  constructor(
    @InjectRepository(JobRequirementEntity)
    private readonly jobRequirementRepository: Repository<JobRequirementEntity>,
    @Inject(REQUEST) request: Request,
  ) {
    super(jobRequirementRepository, request);
  }
 
}

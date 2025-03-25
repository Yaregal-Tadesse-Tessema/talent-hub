/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { JobRequirementEntity } from '../persistance/job-requirement.entity';
import { REQUEST } from '@nestjs/core';
@Injectable()
export class JobRequirementService extends CommonCrudService<JobRequirementEntity> {
  constructor(
    @InjectRepository(JobRequirementEntity)
    private readonly jobRequirementRepository: Repository<JobRequirementEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(jobRequirementRepository, request);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { JobRequirementEntity } from '../persistance/job-requirement.entity';
@Injectable()
export class JobRequirementService extends CommonCrudService<JobRequirementEntity> {
  constructor(
    @InjectRepository(JobRequirementEntity)
    private readonly jobRequirementRepository: Repository<JobRequirementEntity>,
  ) {
    super(jobRequirementRepository);
  }
}

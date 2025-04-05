/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JobRequirementRepository } from '../persistance/job-requirement.repository';
@Injectable()
export class JobRequirementService {
  constructor(
    private readonly jobRequirementRepository: JobRequirementRepository,
  ) {}
}

/* eslint-disable prettier/prettier */
import { InjectRepository } from "@nestjs/typeorm";
import { JobPostingEntity } from "../../job/persistencies/job-posting.entity";
import { CommonCrudService } from "src/libs/Common/common-services/common.service";
import { Repository } from "typeorm";
import { Inject } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { JobRequirementService } from "../usecase/job-requirement.usecase.service";

export class JobRequirementRepository extends CommonCrudService<JobPostingEntity> {
  constructor(
    @InjectRepository(JobPostingEntity)
    private readonly jobPostingsRepository: Repository<JobPostingEntity>,
    private readonly jobRequirementService: JobRequirementService,
    @Inject(REQUEST) request?: Request,
  ) {
    super(jobPostingsRepository, request);
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { CreateJobPostingCommand } from './job-posting.command';
import { JobRequirementService } from '../../job-requirement/usecase/job-requirement.usecase.service';
import { CreateJobRequirementCommand } from '../../job-requirement/usecase/job-requirement.command';
@Injectable()
export class JobPostingService extends CommonCrudService<JobPostingEntity> {
  constructor(
    @InjectRepository(JobPostingEntity)
    private readonly jobPostingRepository: Repository<JobPostingEntity>,
    private readonly jobRequirementService:JobRequirementService
  ) {
    super(jobPostingRepository);
  }

  async createJobPosting(command:CreateJobPostingCommand){
    const jobRequirementCommand:CreateJobRequirementCommand={
      educationLevel:command.educationLevel,
      experienceLevel:command.experienceLevel,
      fieldOfStudy:command.fieldOfStudy,
      gpa:command.gpa
    }
    const jobRequirementEntity=CreateJobRequirementCommand.fromDto(jobRequirementCommand)
    const jobRequirementResult=await this.jobRequirementService.create(jobRequirementEntity)
    command.requirementId=jobRequirementResult.id

    const jobPostingEntity=CreateJobPostingCommand.fromDto(command)
    return await this.jobPostingRepository.save(jobPostingEntity)
    
  }
}

/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { CreateJobPostingCommand } from './job-posting.command';
import { JobRequirementService } from '../../job-requirement/usecase/job-requirement.usecase.service';
import { CreateJobRequirementCommand } from '../../job-requirement/usecase/job-requirement.command';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { JobPostingResponse } from './job-posting.response';
import { QueryConstructor } from 'src/libs/Common/collection-query/query-constructor';
@Injectable()
export class JobPostingService extends CommonCrudService<JobPostingEntity> {
  constructor(
    @InjectRepository(JobPostingEntity)
    private readonly jobPostingRepository: Repository<JobPostingEntity>,
    private readonly jobRequirementService: JobRequirementService,
  ) {
    super(jobPostingRepository);
  }

  async createJobPosting(command: CreateJobPostingCommand) {
    const jobRequirementCommand: CreateJobRequirementCommand = {
      educationLevel: command.educationLevel,
      experienceLevel: command.experienceLevel,
      fieldOfStudy: command.fieldOfStudy,
      gpa: command.gpa,
    };
    const jobRequirementEntity = CreateJobRequirementCommand.fromDto(
      jobRequirementCommand,
    );
    const jobRequirementResult =
      await this.jobRequirementService.create(jobRequirementEntity);
    command.requirementId = jobRequirementResult.id;

    const jobPostingEntity = CreateJobPostingCommand.fromDto(command);
    return await this.jobPostingRepository.save(jobPostingEntity);
  }

  async getJobPostings(
    query: CollectionQuery,
  ): Promise<DataResponseFormat<JobPostingResponse>> {
    try {
      query.includes.push('applications');
      const dataQuery = QueryConstructor.constructQuery<JobPostingEntity>(
        this.jobPostingRepository,
        query,
      );
      const [items, total] = await dataQuery.getManyAndCount();
      const data = items.map((item) => {
        const applicationCount = item.applications.length;
        const response = JobPostingResponse.toResponse(item);
        delete response.applications;
        return { ...response, applicationCount: applicationCount };
      });
      return { items: data, total: total };
    } catch (error) {
      throw error;
    }
  }
  async getJobPostingsBySkill(
    query: CollectionQuery,
    userInfo: any,
  ): Promise<DataResponseFormat<JobPostingResponse>> {
    try {
      query.includes.push('applications');
      const dataQuery = QueryConstructor.constructQuery<JobPostingEntity>(
        this.jobPostingRepository,
        query,
      );
      const skills = userInfo.skills;
      dataQuery.andWhere('skill && :skills', { skills });
      const [items, total] = await dataQuery.getManyAndCount();
      const data = items.map((item) => {
        const applicationCount = item.applications.length;
        const response = JobPostingResponse.toResponse(item);
        delete response.applications;
        return { ...response, applicationCount: applicationCount };
      });
      return { items: data, total: total };
    } catch (error) {
      throw error;
    }
  }
}

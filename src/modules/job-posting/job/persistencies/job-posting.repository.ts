/* eslint-disable prettier/prettier */
import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';

import { JobRequirementService } from '../../job-requirement/usecase/job-requirement.usecase.service';
import { CreateJobRequirementCommand } from '../../job-requirement/usecase/job-requirement.command';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { QueryConstructor } from 'src/libs/Common/collection-query/query-constructor';
import { JobPostingStatusEnums } from '../../constants';
import { REQUEST } from '@nestjs/core';
import { ChangeJobPostStatusCommand, CreateJobPostingCommand, JobPostTelegramNotificationCommand } from '../usecase/job-posting.command';
import { JobPostingResponse } from '../usecase/job-posting.response';
import { JobRequirementRepository } from '../../job-requirement/persistance/job-requirement.repository';
@Injectable()
export class JobPostingRepository extends CommonCrudService<JobPostingEntity> {
  constructor(
    @InjectRepository(JobPostingEntity)
    private readonly jobPostingsRepository: Repository<JobPostingEntity>,
    private readonly jobRequirementService: JobRequirementRepository,
    @Inject(REQUEST) request: Request,
  ) {
    super(jobPostingsRepository, request);
  }

  async createJobPosting(command: CreateJobPostingCommand) {
    const jobRequirementCommand: CreateJobRequirementCommand = {
      educationLevel: command.educationLevel,
      experienceLevel: command.experienceLevel,
      fieldOfStudy: command.fieldOfStudy,
      gpa: command.minimumGPA,
    };
    const jobRequirementEntity = CreateJobRequirementCommand.fromDto(
      jobRequirementCommand,
    );
    const jobRequirementResult =
      await this.jobRequirementService.create(jobRequirementEntity);
    command.requirementId = jobRequirementResult.id;

    const jobPostingEntity = CreateJobPostingCommand.fromDto(command);
    return await this.create(jobPostingEntity);
  }

  async getJobPostings(
    query: CollectionQuery,
    userInfo: any,
  ): Promise<DataResponseFormat<JobPostingResponse>> {
    try {
      query.includes.push('savedUsers');
      const dataQuery = QueryConstructor.constructQuery<JobPostingEntity>(
        this.jobPostingsRepository,
        query,
      );
      const [items, total] = await dataQuery.getManyAndCount();
      const data = items.map((item) => {
        let isSaved = false;
        const response = JobPostingResponse.toResponse(item);
        if (item.savedUsers?.length > 0) {
          const userExists = item.savedUsers.some(
            (user) => user.userId === userInfo.id,
          );
          isSaved = userExists ? true : false;
        }
        response.isSaved = isSaved;
        return { ...response };
      });
      return { items: data, total: total };
    } catch (error) {
      throw error;
    }
  }
  async changeJobPostStatus(
    command: ChangeJobPostStatusCommand,
  ): Promise<JobPostingResponse> {
    try {
      const jobPostDomain = await this.jobPostingsRepository.findOne({
        where: { id: command.id },
      });
      if (!jobPostDomain)
        throw new NotFoundException(
          `Job post with Id ${command.id} is not Found`,
        );
      jobPostDomain.status = command.status;
      const response = await this.jobPostingsRepository.save(jobPostDomain);
      if (command.status === JobPostingStatusEnums.POSTED) {
        // const eligibleUsers = await this.getEligibleUsersForTheJobPost(
        //   response.skill,
        // );

        const messageCommand: JobPostTelegramNotificationCommand = {
          deadline: response.deadline,
          jobTitle: response.title,
          jobDescription: response.description,
          applicationLink: response.applicationURL,
          Salary: response.salaryRange
            ? response.salaryRange
            : 'Based On Company Standard',
          jobType: response.employmentType,
          workLocation: response.location,
        };
        // for (let index = 0; index < eligibleUsers?.length; index++) {
        //   const element = eligibleUsers[index];
        //   const notify = await this.notifyUsersOnTelegramBoot(
        //     element.telegramUserId,
        //     messageCommand,
        //     jobPostDomain.id,
        //   );
        //   console.log(notify);
        // }
      }
      return JobPostingResponse.toResponse(response);
    } catch (error) {
      throw error;
    }
  }

  // async getEligibleUsersForTheJobPost(skills: string[]) {
  //    const connection: DataSource = await this.request['CONNECTION_KEY'];
  //       const repository = connection.getRepository(this.repository.target);
  //   const query: CollectionQuery = new CollectionQuery();
  //   const dataQuery = QueryConstructor.constructQuery<UserEntity>(
  //     this.userRepository,
  //     query,
  //   );
  //   dataQuery.andWhere('skills && :skills', { skills });
  //   const result = this.jobPostingsRepository.get
  //   return result;
  // }
  async getJobPostingsBySkill(
    query: CollectionQuery,
    userInfo: any,
  ): Promise<DataResponseFormat<JobPostingResponse>> {
    try {
      query.includes.push('savedUsers');
      const dataQuery = QueryConstructor.constructQuery<JobPostingEntity>(
        this.jobPostingsRepository,
        query,
      );
      const skills = userInfo.skills;
      dataQuery.andWhere('skill && :skills', { skills });
      const [items, total] = await dataQuery.getManyAndCount();
      const data = items.map((item) => {
        let isSaved = false;
        const response = JobPostingResponse.toResponse(item);
        if (item.savedUsers?.length > 0) {
          const userExists = item.savedUsers.some(
            (user) => user.userId === userInfo.id,
          );
          isSaved = userExists ? true : false;
        }
        response.isSaved = isSaved;
        return { ...response };
      });
      return { items: data, total: total };
    } catch (error) {
      throw error;
    }
  }
  constructJobPostMessage(command: JobPostTelegramNotificationCommand): string {
    return `🔹 *Job Title:* ${command.jobTitle}
  
  🔹 *Job Type:* ${command.jobType}
  
  🔹 *Work Location:* ${command.workLocation}
  
  🔹 *Salary/Compensation:* ${command.Salary}
  
  🔹 *Deadline:* ${new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(command.deadline))}
  
  🔹 *Description:*
  ${command.jobDescription}
  
  🔹 *[Apply Here](${command.applicationLink})*`;
  }
}

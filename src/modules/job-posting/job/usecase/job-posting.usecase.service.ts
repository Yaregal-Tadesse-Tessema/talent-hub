/* eslint-disable prettier/prettier */
import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
import {
  ChangeJobPostStatusCommand,
  CreateJobPostingCommand,
  JobPostTelegramNotificationCommand,
  RePostJobCommand,
} from './job-posting.command';
import { JobRequirementService } from '../../job-requirement/usecase/job-requirement.usecase.service';
import { CreateJobRequirementCommand } from '../../job-requirement/usecase/job-requirement.command';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { JobPostingResponse } from './job-posting.response';
import { QueryConstructor } from 'src/libs/Common/collection-query/query-constructor';
import { JobPostingStatusEnums } from '../../constants';
import { REQUEST } from '@nestjs/core';
import { UserService } from 'src/modules/user/usecase/user.usecase.service';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPostingEntity)
    private jobPostingRepository: Repository<JobPostingEntity>,
    private readonly jobRequirementService: JobRequirementService,
    // @Inject(forwardRef(() => TelegramBotService))
    // private readonly telegramBotService: TelegramBotService,
    private readonly userRepository: UserService,
    @Inject(REQUEST) private readonly request?: Request,
  ) {}
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
    return await this.jobPostingRepository.create(jobPostingEntity);
  }

  async getJobPostings(
    query: CollectionQuery,
    userInfo: any,
  ): Promise<DataResponseFormat<JobPostingResponse>> {
    try {
      const privateCOnnection: DataSource =
        await this.request['CONNECTION_KEY'];
      const repository = privateCOnnection.getRepository(JobPostingEntity);
      query.includes.push('savedUsers');
      const dataQuery = QueryConstructor.constructQuery<JobPostingEntity>(
        repository,
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
        delete response.savedUsers;
        return { ...response };
      });
      return { items: data, total: total };
    } catch (error) {
      throw error;
    }
  }
  async getAllJobPostings(
    query: CollectionQuery,
  ): Promise<DataResponseFormat<JobPostingResponse>> {
    try {
      const dataQuery = QueryConstructor.constructQuery<JobPostingEntity>(
        this.jobPostingRepository,
        query,
      );
      const [items, total] = await dataQuery.getManyAndCount();
      const data = items.map((item) => {
        const response = JobPostingResponse.toResponse(item);
        return response;
      });
      return { items: data, total: total };
    } catch (error) {
      throw error;
    }
  }
  async isJobSaved(savedUsers: any, currentUserId: string) {
    if (savedUsers?.length > 0) {
      const userExists = savedUsers.some(
        (user) => user.userId === currentUserId,
      );
      const isSaved = userExists ? true : false;
      return isSaved;
    }
    return false;
  }
  async changeJobPostStatus(
    command: ChangeJobPostStatusCommand,
  ): Promise<JobPostingResponse> {
    const jobPostDomain = await this.jobPostingRepository.findOne({
      where: { id: command.id },
    });
    if (!jobPostDomain)
      throw new NotFoundException(
        `Job post with Id ${command.id} is not Found`,
      );
    jobPostDomain.status = command.status;
    const response = await this.jobPostingRepository.create(jobPostDomain);
    if (command.status === JobPostingStatusEnums.POSTED) {
      const eligibleUsers = await this.getEligibleUsersForTheJobPost(
        response.skill,
      );
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
      for (let index = 0; index < eligibleUsers?.length; index++) {
        const eligibleUser = eligibleUsers[index];
        if (!eligibleUser.telegramUserId) continue;
        await this.notifyUsersOnTelegramBoot(
          eligibleUser.telegramUserId,
          messageCommand,
          jobPostDomain.id,
        );
      }
    }
    return JobPostingResponse.toResponse(response);
  }
  async getEligibleUsersForTheJobPost(skills: string[]) {
    return await this.userRepository.getEligibleUsersForTheJobPost(skills);
  }
  async getJobPostingsBySkill(
    query: CollectionQuery,
    userInfo: any,
  ): Promise<DataResponseFormat<JobPostingResponse>> {
    try {
      query.includes.push('savedUsers');
      query.includes.push('applications');
      const dataQuery = QueryConstructor.constructQuery<JobPostingEntity>(
        this.jobPostingRepository,
        query,
      );
      const skills = userInfo.skills;
      if (skills) {
        dataQuery.andWhere('technicalSkills && :technicalSkills', { skills });
      }
      const [items, total] = await dataQuery.getManyAndCount();
      const data = items.map((item) => {
        let isSaved = false;
        let isApplied = false;
        const response = JobPostingResponse.toResponse(item);
        if (item.savedUsers?.length > 0) {
          const userExists = item.savedUsers.some(
            (user) => user.userId === userInfo.id,
          );
          isSaved = userExists ? true : false;
        }
        if (item.applications?.length > 0) {
          const userExists = item.applications.some(
            (application) => application.userId === userInfo.id,
          );
          isApplied = userExists ? true : false;
        }
        response.isSaved = isSaved;
        response.isApplied = isApplied;
        delete response.savedUsers;
        return { ...response };
      });
      return { items: data, total: total };
    } catch (error) {
      throw error;
    }
  }
  async notifyUsersOnTelegramBoot(
    userId: string,
    command: JobPostTelegramNotificationCommand,
    JobPostId: string,
  ) {
    try {
      // if (!userId || !command) return;
      // const message = this.constructJobPostMessage(command);
      // if (!message) return;
      // const result = await this.telegramBotService.sendMessage(
      //   userId,
      //   message,
      //   JobPostId,
      // );
      return true;
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

  async getOne(
    id: any,
    userId: any,
    relations = [],
    withDeleted = false,
  ): Promise<JobPostingResponse> {
    relations.push('savedUsers');
    const result = await this.jobPostingRepository.findOne({
      where: { id },
      relations,
      withDeleted,
    });
    if (!result) return null;
    const Saved = result?.savedUsers?.find(
      (item) => item.userId == userId && item.jobPostId == result.id,
    );
    const isSaved = Saved ? true : false;
    const response = JobPostingResponse.toResponse(result);
    response.isSaved = isSaved;
    return response;
  }
  async rePostJob(command: RePostJobCommand) {
    const jobPost = await this.jobPostingRepository.findOne({
      where: { id: command.jobPostId },
    });
    if (!jobPost)
      throw new BadGatewayException(
        `Job post with id ${command.jobPostId} does not exist`,
      );
    const now = new Date();
    const nextMonth = new Date(now.setMonth(now.getMonth() + 1));
    delete jobPost.id;
    jobPost.savedUsers = null;
    jobPost.onHoldDate = null;
    jobPost.applicationCount = 0;
    jobPost.applications = null;
    jobPost.deadline = command.deadLine ? command.deadLine : nextMonth;
    jobPost.postedDate = new Date();
    jobPost.status = JobPostingStatusEnums.POSTED;
    const result = await this.jobPostingRepository.create(jobPost);
    return JobPostingResponse.toResponse(result);
  }
}

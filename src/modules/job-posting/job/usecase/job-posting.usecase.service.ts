/* eslint-disable prettier/prettier */
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ChangeJobPostStatusCommand,
  CreateJobPostingCommand,
  JobPostTelegramNotificationCommand,
  RePostJobCommand,
  UpdateJobPostingCommand,
} from './job-posting.command';
import { CollectionQuery, Where } from 'src/libs/Common/collection-query/query';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { JobPostingResponse } from './job-posting.response';
import { JobPostingStatusEnums } from '../../constants';
import { UserService } from 'src/modules/user/usecase/user.usecase.service';
import { JobPostingRepository } from '../persistencies/job-post.repository';
import { TelegramBotService } from 'src/modules/telegram/usecase/telegram-boot-service';
@Injectable()
export class JobPostingService {
  constructor(
    private readonly jobPostingRepository: JobPostingRepository,
    private readonly telegramBotService: TelegramBotService,
    private readonly userRepository: UserService,
  ) {}
  async createJobPosting(command: CreateJobPostingCommand) {
    const jobPostingEntity = CreateJobPostingCommand.fromDto(command);
    return await this.jobPostingRepository.create(jobPostingEntity);
  }
  async updateJobPosting(command: UpdateJobPostingCommand) {
    if (!command.id) throw new BadRequestException(`Id is Mandatory`);
    const jobPost = await this.jobPostingRepository.findOne(command.id);
    if (!jobPost)
      throw new BadRequestException(
        `job post with id ${command.id} doesn't exist`,
      );
    if (jobPost.status == JobPostingStatusEnums.POSTED)
      throw new BadRequestException(`Can't edit  approved jobPosts`);
    const jobPostingEntity = UpdateJobPostingCommand.fromDto(command);
    return await this.jobPostingRepository.create(jobPostingEntity);
  }
  async getJobPostings(
    query: CollectionQuery,
    userInfo?: any,
  ): Promise<DataResponseFormat<JobPostingResponse>> {
    try {
      query.includes.push('savedUsers');
      const { items, total } = await this.jobPostingRepository.findAll(query);
      const data = items.map((item) => {
        let isSaved = false;
        const response = JobPostingResponse.toResponse(item);
        if (item.savedUsers?.length > 0) {
          const userExists = item.savedUsers.some(
            (user) => user.userId === userInfo?.id,
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
      query.where.push();
      const result = await this.jobPostingRepository.findAll(query);
      const response: DataResponseFormat<JobPostingResponse> = {
        items: result.items.map((item) => JobPostingResponse.toResponse(item)),
        total: result.total,
      };
      return response;
    } catch (error) {
      console.log(error);
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
    const jobPostDomain = await this.jobPostingRepository.findOne(
      command.id,
      [],
    );
    if (!jobPostDomain)
      throw new NotFoundException(
        `Job post with Id ${command.id} is not Found`,
      );
    jobPostDomain.status = command.status;
    const response = await this.jobPostingRepository.create(jobPostDomain);
    if (
      command.status === JobPostingStatusEnums.POSTED &&
      response.skill.length > 0
    ) {
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
      if (userInfo.skills?.length) {
        query.where = query.where || [];
        query.where.push([
          { column: 'technicalSkills', value: userInfo.skills, operator: 'In' },
        ]);
      }

      const { items, total } = await this.jobPostingRepository.findAll(query);

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
      if (!userId || !command) return;
      const message = this.constructJobPostMessage(command);
      if (!message) return;
      const result = await this.telegramBotService.sendMessage(
        userId,
        message,
        JobPostId,
      );
      console.log(result);
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
    const result = await this.jobPostingRepository.findOne(
      id,
      relations,
      withDeleted,
    );
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
    const jobPost = await this.jobPostingRepository.findOne(command.jobPostId);
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

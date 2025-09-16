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
  JobPostFeaturingCOmmand,
  JobPostTelegramNotificationCommand,
  RePostJobCommand,
  UpdateJobPostingCommand,
} from './job-posting.command';
import { CollectionQuery, Order } from 'src/libs/Common/collection-query/query';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { JobPostingResponse } from './job-posting.response';
import { JobPostingStatusEnums } from '../../constants';
import { UserService } from 'src/modules/user/usecase/user.usecase.service';
import { JobPostingRepository } from '../persistencies/job-post.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
import { Brackets, Repository } from 'typeorm';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { UserAlertConfiguration } from 'src/modules/user/usecase/user.command';
import { TelegramBotService } from 'src/modules/telegram/usecase/telegram-bot.service';
import { EmailService } from 'src/modules/notification/usecase/email.usecase.command';
import { AfroMessageService } from 'src/modules/sms/afro-message.service';
@Injectable()
export class JobPostingService {
  constructor(
    private readonly jobPostingRepository: JobPostingRepository,
    private readonly userRepository: UserService,
    @InjectRepository(JobPostingEntity)
    private readonly joPoRepo: Repository<JobPostingEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly telegramBotService: TelegramBotService,
    private readonly emailService: EmailService,
    private readonly afroMessageService: AfroMessageService,
  ) { }
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
    // if (jobPost.status == JobPostingStatusEnums.POSTED)
    // throw new BadRequestException(`Can't edit  approved jobPosts`);
    const jobPostingEntity = UpdateJobPostingCommand.fromDto(command);
    const response = await this.jobPostingRepository.create(jobPostingEntity);
    await this.notifyUsersOnTelegramBootForNewJobPost(response);
    return response;
  }
  async getApplicationCountByJobPostId(id: string): Promise<number> {
    const jobPost = await this.jobPostingRepository.findOne(id);
    if (!jobPost)
      throw new BadRequestException(
        `job post with id ${id} doesn't exist`,
      );
    return jobPost.applicationCount;
  }
  async getJobPostings(
    query: CollectionQuery,
    userInfo?: any,
  ): Promise<DataResponseFormat<JobPostingResponse>> {
    try {
      const today = new Date();
      const formatted = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          0,
          0,
          0,
        ),
      ).toISOString();
      query.where = query.where || [];
      query.where.push([
        { column: 'deadline', value: formatted, operator: '>=' },
      ]);
      query.orderBy = query.orderBy || [];
      query.orderBy.push({
        column: 'postedDate',
        direction: 'DESC'
      });
      query.includes.push('savedUsers');
      query.includes.push('applications');
      query.includes.push('favoriteJobs');
      const { items, total } = await this.jobPostingRepository.findAll(query);
      const data = items.map((item) => {
        let isSaved = false;
        let isApplied = false;
        let isFavorite = false;
        const response = JobPostingResponse.toResponse(item);
        if (item.savedUsers?.length > 0) {
          const userExists = item.savedUsers.some(
            (user) => user.userId === userInfo?.id,
          );
          isSaved = userExists ? true : false;
        }
        if (item.applications?.length > 0) {
          const userExists = item.applications.some(
            (user) => user.userId === userInfo?.id,
          );
          isApplied = userExists ? true : false;
        }
        if (item.favoriteJobs?.length > 0) {
          const userExists = item.favoriteJobs.some(
            (user) => user.userId === userInfo?.id,
          );
          isFavorite = userExists ? true : false;
        }
        response.isSaved = isSaved;
        response.isApplied = isApplied;
        response.isFavorite = isFavorite;
        delete response.savedUsers;
        delete response.applications;
        delete response.favoriteJobs;
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
      const today = new Date();
      const formatted = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          0,
          0,
          0,
        ),
      ).toISOString();
      query.where = query.where || [];
      query.where.push([
        { column: 'deadline', value: formatted, operator: '>=' },
      ]);
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
    if (command.status == JobPostingStatusEnums.POSTED) {
      const payload = {
        jobTitle: jobPostDomain.title,
        position: jobPostDomain.position,
        industry: jobPostDomain.industry,
        city: jobPostDomain.city,
        // salaryRange: jobPostDomain.salaryRange
      }

      const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([key, value]) =>
          value &&
          typeof value === 'string' &&
          value !== 'string' &&
          value.trim() !== '' &&
          value !== 'null' &&
          value !== 'undefined'
        )
      );
      const users: { phoneNumber: string, email: string, fullName: string }[] = await this.getUsersByPartialJobMatch(filteredPayload)
      // to be replaced by the job link
      const link = process.env.LOGIN_PAGE ?? 'http://138.197.105.31:3000/login'
      await this.notifayUsers(users, link)
    }
    return JobPostingResponse.toResponse(response);
  }
  async notifayUsers(payload: { phoneNumber: string, email: string, fullName: string }[], link: string) {
    const response: any[] = []

    // Check if payload is valid array with users
    if (!payload || !Array.isArray(payload) || payload.length === 0) {
      return response;
    }
    for (const user of payload) {
      const message = `Dear ${user.fullName} This Jobs match your skill please check them ${link}`
      const result = await this.afroMessageService.sendMessage(message, user.phoneNumber, null)
      const resultEmail = await this.emailService.sendEmail(user.email, message, null)
      response.push(result)
    }
    return response
  }

  async notifyUsersOnTelegramBootForNewJobPost(
    response: JobPostingEntity
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
        response.id,
      );
    }
  }
  async getEligibleUsersForTheJobPost(skills: string[]) {
    return await this.userRepository.getEligibleUsersForTheJobPost(skills);
  }
  async getActiveJobsCount(query: CollectionQuery) {
    query.where = query.where || [];
    query.where.push([
      {
        column: 'status',
        operator: '=',
        value: JobPostingStatusEnums.POSTED,
      },
    ]);
    const result = await this.jobPostingRepository.findAll(query);
    return result.total;
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
      // const result = await this.telegramBotService.sendMessage(
      //   userId,
      //   message,
      //   JobPostId,
      // );
      // console.log(result);
      return true;
    } catch (error) {
      return false
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
    relations = [],
    withDeleted = false,
    userId?: any,
  ): Promise<JobPostingResponse> {
    if(userId){
      relations.push('savedUsers');
      relations.push('applications');
      relations.push('favoriteJobs');
    }
    const result = await this.jobPostingRepository.findOne(
      id,
      relations,
      withDeleted,
    );
    if (!result) return null;

    let isApplied = false;
    let isFavorite = false;
    let isSaved = false;

    if (userId) {
      if (result.savedUsers?.length > 0) {
        const userExists = result.savedUsers.some(
          (savedUser) => savedUser.userId === userId,
        );
        isSaved = userExists ? true : false;
      }
      if (result.applications?.length > 0) {
        const userExists = result.applications.some(
          (application) => application.userId === userId,
        );
        isApplied = userExists ? true : false;
      }
      if (result.favoriteJobs?.length > 0) {
        const userExists = result.favoriteJobs.some(
          (user) => user.userId === userId,
        );
        isFavorite = userExists ? true : false;
      }
    }
    const response = JobPostingResponse.toResponse(result);
    response.isSaved = isSaved;
    response.isApplied = isApplied;
    response.isFavorite = isFavorite;
    return response;
  }
  async getOneById(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<JobPostingResponse> {
    const result = await this.jobPostingRepository.findOne(
      id,
      relations,
      withDeleted,
    );
    if (!result) return null;

    return JobPostingResponse.toResponse(result);
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
  async getJobTitleStatistics(): Promise<
    { title: string; openPositions: number }[]
  > {
    const result = await this.joPoRepo
      .createQueryBuilder('job')
      .select('job.title', 'title')
      .addSelect('SUM(job.positionNumbers)', 'openPositions')
      .groupBy('job.title')
      .getRawMany();
    return result;
  }
  async getJobIndustryStatistics(): Promise<
    { title: string; openPositions: number }[]
  > {
    const result = await this.joPoRepo
      .createQueryBuilder('job')
      .select('job.industry', 'industry')
      .addSelect('SUM(job.positionNumbers)', 'openPositions')
      .groupBy('job.industry')
      .getRawMany();
    return result;
  }
  async makeJobPostFeatured(
    command: JobPostFeaturingCOmmand,
  ): Promise<JobPostingResponse> {
    const result = await this.jobPostingRepository.update(command.id, {
      isFeatured: command.status,
    });
    return JobPostingResponse.toResponse(result);
  }
  async getUserByJobPostProperty(command: UserAlertConfiguration) {
    const query = this.userRepo
      .createQueryBuilder('user')
      .where(new Brackets(qb => {
        const filters: [string, string, any][] = [
          ['address', 'address', command.address],
          ['Position', 'Position', command.Position],
          ['jobTitle', 'jobTitle', command.jobTitle],
          ['industry', 'industry', command.industry],
          ['salary', 'salary', command.salary],
        ];

        let hasAtLeastOneFilter = false;

        for (const [key, param, value] of filters) {
          if (value !== undefined && value !== null && value !== '') {
            qb.andWhere(`"user"."smsAlertConfiguration"->>:${param} = :${param}`, { [param]: value });
            hasAtLeastOneFilter = true;
          }
        }

        // Prevent empty brackets which cause invalid SQL
        if (!hasAtLeastOneFilter) {
          qb.where('TRUE'); // Always true
        }
      }))
      .andWhere(`"user"."deletedAt" IS NULL`);
    const result = await query.getMany();
    console.log(query.getSql())
    return result;
  }
  async getUserByJobPostORProperty(command: UserAlertConfiguration) {
    // Find users where at least one smsAlertConfiguration matches ANY of the given command properties (OR logic)
    const result = await this.userRepo
      .createQueryBuilder('user')
      .where(new Brackets(qb => {
        qb.where(`"user"."smsAlertConfiguration"->>'address' = :address`, { address: command.address ?? '' })
          .orWhere(`"user"."smsAlertConfiguration"->>'Position' = :Position`, { Position: command.Position ?? '' })
          .orWhere(`"user"."smsAlertConfiguration"->>'jobTitle' = :jobTitle`, { jobTitle: command.jobTitle ?? '' })
          .orWhere(`"user"."smsAlertConfiguration"->>'industry' = :industry`, { industry: command.industry ?? '' })
          .orWhere(`"user"."smsAlertConfiguration"->>'salary' = :salary`, { salary: command.salary ?? '' });
      }))
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getMany();
    return result;
  }

  /**
   * Get job postings that EXACTLY match user's alert configuration (AND logic)
   * All specified alert configuration properties must match the job posting
   */
  async getJobPostingsByExactAlertMatch(alertConfiguration: UserAlertConfiguration): Promise<JobPostingResponse[]> {
    try {
      const query = this.joPoRepo
        .createQueryBuilder('job')
        .where('job.deletedAt IS NULL')
        .andWhere('job.status = :status', { status: JobPostingStatusEnums.POSTED });

      // Build exact match conditions for each alert configuration property
      if (alertConfiguration.jobTitle) {
        query.andWhere('job.title ILIKE :jobTitle', { jobTitle: `%${alertConfiguration.jobTitle}%` });
      }

      if (alertConfiguration.Position) {
        query.andWhere('job.position ILIKE :position', { position: `%${alertConfiguration.Position}%` });
      }

      if (alertConfiguration.industry) {
        query.andWhere('job.industry ILIKE :industry', { industry: `%${alertConfiguration.industry}%` });
      }

      if (alertConfiguration.address) {
        query.andWhere('job.city ILIKE :location', { location: `%${alertConfiguration.address}%` });
      }

      if (alertConfiguration.salary) {
        // Match salary expectations based on SalaryRangeEnum structure
        // Check if the job has a salary range that matches the user's salary preference
        query.andWhere('job."salaryRange" IS NOT NULL')
          .andWhere('job."salaryRange"->>\'MINIMUM\' = :salaryMin', { salaryMin: alertConfiguration.salary });
      }

      // Only return active jobs (not expired)
      const today = new Date();
      const formatted = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          0,
          0,
          0,
        ),
      ).toISOString();
      query.andWhere('job.deadline >= :deadline', { deadline: formatted });

      const jobPostings = await query
        .orderBy('job.postedDate', 'DESC')
        .getMany();

      return jobPostings.map(job => JobPostingResponse.toResponse(job));
    } catch (error) {
      console.error('Error getting job postings by exact alert match:', error);
      throw error;
    }
  }

  /**
   * Get job postings that match AT LEAST ONE user's alert configuration property (OR logic)
   * Any of the specified alert configuration properties can match the job posting
   */
  async getJobPostingsByPartialAlertMatch(alertConfiguration: UserAlertConfiguration): Promise<JobPostingResponse[]> {
    try {
      const query = this.joPoRepo
        .createQueryBuilder('job')
        .where('job.deletedAt IS NULL')
        .andWhere('job.status = :status', { status: JobPostingStatusEnums.POSTED });

      // Build OR conditions for partial matching
      const conditions: string[] = [];
      const parameters: any = {};

      if (alertConfiguration.jobTitle) {
        conditions.push('job.title ILIKE :jobTitle');
        parameters.jobTitle = `%${alertConfiguration.jobTitle}%`;
      }

      if (alertConfiguration.Position) {
        conditions.push('job.position ILIKE :position');
        parameters.position = `%${alertConfiguration.Position}%`;
      }

      if (alertConfiguration.industry) {
        conditions.push('job.industry ILIKE :industry');
        parameters.industry = `%${alertConfiguration.industry}%`;
      }

      if (alertConfiguration.address) {
        conditions.push('job.city ILIKE :city');
        parameters.city = `%${alertConfiguration.address}%`;
      }

      if (alertConfiguration.salary) {
        // Match salary expectations based on SalaryRangeEnum structure
        conditions.push('(job."salaryRange" IS NOT NULL AND job."salaryRange"->>\'MINIMUM\' = :salaryMin)');
        parameters.salaryMin = alertConfiguration.salary;
      }

      // If we have conditions, apply OR logic
      if (conditions.length > 0) {
        query.andWhere(`(${conditions.join(' OR ')})`, parameters);
      }

      // Only return active jobs (not expired)
      const today = new Date();
      const formatted = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          0,
          0,
          0,
        ),
      ).toISOString();
      query.andWhere('job.deadline >= :deadline', { deadline: formatted });

      const jobPostings = await query
        .orderBy('job.postedDate', 'DESC')
        .getMany();

      return jobPostings.map(job => JobPostingResponse.toResponse(job));
    } catch (error) {
      console.error('Error getting job postings by partial alert match:', error);
      throw error;
    }
  }

  /**
   * Get users whose alert configuration EXACTLY matches the job posting (AND logic)
   * All specified job posting properties must match the user's alert configuration
   */
  async getUsersByExactJobMatch(jobData: {
    title?: string;
    position?: string;
    industry?: string;
    city?: string;
    salaryRange?: any;
  }): Promise<UserEntity[]> {
    try {
      const query = this.userRepo
        .createQueryBuilder('user')
        .where('user.deletedAt IS NULL');

      // Build exact match conditions for each job property
      if (jobData.title) {
        query.andWhere('(user.alertConfiguration IS NOT NULL AND jsonb_array_length(user.alertConfiguration) > 0 AND EXISTS(SELECT 1 FROM jsonb_array_elements(user.alertConfiguration) AS config WHERE config->>\'jobTitle\' ILIKE :jobTitle))', {
          jobTitle: `%${jobData.title}%`
        });
      }

      if (jobData.position) {
        query.andWhere('(user.alertConfiguration IS NOT NULL AND jsonb_array_length(user.alertConfiguration) > 0 AND EXISTS(SELECT 1 FROM jsonb_array_elements(user.alertConfiguration) AS config WHERE config->>\'Position\' ILIKE :position))', {
          position: `%${jobData.position}%`
        });
      }

      if (jobData.industry) {
        query.andWhere('(user.alertConfiguration IS NOT NULL AND jsonb_array_length(user.alertConfiguration) > 0 AND EXISTS(SELECT 1 FROM jsonb_array_elements(user.alertConfiguration) AS config WHERE config->>\'industry\' ILIKE :industry))', {
          industry: `%${jobData.industry}%`
        });
      }

      if (jobData.city) {
        query.andWhere('(user.alertConfiguration IS NOT NULL AND jsonb_array_length(user.alertConfiguration) > 0 AND EXISTS(SELECT 1 FROM jsonb_array_elements(user.alertConfiguration) AS config WHERE config->>\'address\' ILIKE :address))', {
          address: `%${jobData.city}%`
        });
      }

      if (jobData.salaryRange) {
        // Match salary expectations based on SalaryRangeEnum structure
        query.andWhere('(user.alertConfiguration IS NOT NULL AND jsonb_array_length(user.alertConfiguration) > 0 AND EXISTS(SELECT 1 FROM jsonb_array_elements(user.alertConfiguration) AS config WHERE config->>\'salary\' IS NOT NULL AND config->>\'salary\' = :salaryMin))', {
          salaryMin: jobData.salaryRange?.MINIMUM || jobData.salaryRange
        });
      }

      const users = await query.getMany();
      return users;
    } catch (error) {
      console.error('Error getting users by exact job match:', error);
      throw error;
    }
  }

  /**
   * Get users whose alert configuration matches AT LEAST ONE job posting property (OR logic)
   * Any of the specified job posting properties can match the user's alert configuration
   */
  async getUsersByPartialJobMatch(jobData: {
    jobTitle?: string;
    position?: string;
    industry?: string;
    city?: string;
    salaryRange?: any;
  }): Promise<{ phoneNumber: string, email: string, fullName: string }[]> {
    try {
      const query = this.userRepo
        .createQueryBuilder('user')
        .where('user.deletedAt IS NULL');

      // Build OR conditions for partial matching
      const conditions: string[] = [];
      const parameters: any = {};

      if (jobData.jobTitle) {
        conditions.push('("user"."smsAlertConfiguration" IS NOT NULL AND jsonb_typeof("user"."smsAlertConfiguration") = \'array\' AND EXISTS(SELECT 1 FROM jsonb_array_elements("user"."smsAlertConfiguration") AS config WHERE config->>\'jobTitle\' ILIKE :jobTitle))');
        parameters.jobTitle = `%${jobData.jobTitle}%`;
      }

      if (jobData.position) {
        conditions.push('("user"."smsAlertConfiguration" IS NOT NULL AND jsonb_typeof("user"."smsAlertConfiguration") = \'array\' AND EXISTS(SELECT 1 FROM jsonb_array_elements("user"."smsAlertConfiguration") AS config WHERE config->>\'Position\' ILIKE :position))');
        parameters.position = `%${jobData.position}%`;
      }

      if (jobData.industry) {
        conditions.push('("user"."smsAlertConfiguration" IS NOT NULL AND jsonb_typeof("user"."smsAlertConfiguration") = \'array\' AND EXISTS(SELECT 1 FROM jsonb_array_elements("user"."smsAlertConfiguration") AS config WHERE config->>\'industry\' ILIKE :industry))');
        parameters.industry = `%${jobData.industry}%`;
      }

      if (jobData.city) {
        conditions.push('("user"."smsAlertConfiguration" IS NOT NULL AND jsonb_typeof("user"."smsAlertConfiguration") = \'array\' AND EXISTS(SELECT 1 FROM jsonb_array_elements("user"."smsAlertConfiguration") AS config WHERE config->>\'address\' ILIKE :address))');
        parameters.address = `%${jobData.city}%`;
      }

      if (jobData.salaryRange) {
        // Match salary expectations based on SalaryRangeEnum structure
        conditions.push('("user"."smsAlertConfiguration" IS NOT NULL AND jsonb_typeof("user"."smsAlertConfiguration") = \'array\' AND EXISTS(SELECT 1 FROM jsonb_array_elements("user"."smsAlertConfiguration") AS config WHERE config->>\'salary\' IS NOT NULL AND config->>\'salary\' = :salaryMin))');
        parameters.salaryMin = jobData.salaryRange?.MINIMUM || jobData.salaryRange;
      }

      // If we have conditions, apply OR logic
      if (conditions.length > 0) {
        query.andWhere(`(${conditions.join(' OR ')})`, parameters);
      } else {
        // If no conditions are provided, return empty array to prevent returning all users
        console.log('No job data provided, returning empty array');
        return [];
      }

      // Debug: Log the generated SQL and parameters
      console.log('=== getUsersByPartialJobMatch DEBUG ===');
      console.log('Job Data:', jobData);
      console.log('Conditions:', conditions);
      console.log('Parameters:', parameters);
      console.log('Generated SQL:', query.getSql());
      console.log('SQL Parameters:', query.getParameters());

      const users = await query.getMany();

      const usersInfo: { phoneNumber: string, email: string, fullName: string }[] = users?.map(user => ({ phoneNumber: user.phone, email: user.email, fullName: `${user.firstName} ${user.middleName} ${user.lastName}` }))

      return usersInfo;
    } catch (error) {
      console.error('Error getting users by partial job match:', error);
      throw error;
    }
  }

}

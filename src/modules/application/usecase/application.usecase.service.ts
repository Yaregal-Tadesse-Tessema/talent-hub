/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ChangeApplicationStatus,
  CreateApplicationCommand,
  PrepareScheduleCommand,
} from './application.command';
import { ApplicationRepository } from '../persistences/application.repository';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { ApplicationResponse } from './application.response';
import { UserService } from 'src/modules/user/usecase/user.usecase.service';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { FileService } from 'src/modules/file/services/file.service';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { JobPostingRepository } from 'src/modules/job-posting/job/persistencies/job-post.repository';
import { EmailService } from 'src/modules/notification/usecase/email.usecase.command';
import { ApplicationEntity } from '../persistences/application.entity';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
@Injectable()
export class ApplicationService {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly fileService: FileService,
    private readonly jobPostingRepository: JobPostingRepository,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}
  async create(
    command: CreateApplicationCommand,
  ): Promise<ApplicationResponse> {
    const item = await this.applicationRepository.create(command);
    const res = await this.applicationRepository.create(item);
    console.log(res);
    return item;
  }
  async findAll(
    query: CollectionQuery,
  ): Promise<DataResponseFormat<ApplicationResponse>> {
    const response = await this.applicationRepository.findAll(query);
    const d = new DataResponseFormat<ApplicationResponse>();
    d.items = response?.items?.map((item) =>
      ApplicationResponse.toResponse(item),
    );
    d.total = response?.total;
    return d;
  }
  async findOne(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<ApplicationResponse> {
    const response = await this.applicationRepository.findOne(
      id,
      relations,
      withDeleted,
    );
    return ApplicationResponse.toResponse(response);
  }
  async update(id: string, itemData: any): Promise<ApplicationResponse> {
    await this.findOneOrFail(id);
    await this.applicationRepository.update(id, itemData);
    const res = await this.findOne(id);
    return res;
  }
  async softDelete(id: string): Promise<any> {
    const item = await this.findOneOrFail(id);
    await this.applicationRepository.softDelete(item.id);
    return true;
  }
  async restore(id: string): Promise<boolean> {
    await this.findOneOrFailWithDeleted(id);
    await this.applicationRepository.restore(id);
    return true;
  }
  async findAllArchived(query: CollectionQuery) {
    if (!query.where) {
      query.where = [];
    }
    query.where.push([
      { column: 'deletedAt', value: '', operator: 'IsNotNull' },
    ]);
    const response = await this.applicationRepository.findAllArchived(query);
    return response;
  }
  private async findOneOrFail(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<ApplicationResponse> {
    const item = await this.findOne(id, relations, withDeleted);
    if (!item) {
      throw new NotFoundException(`not_found`);
    }
    return item;
  }
  private async findOneOrFailWithDeleted(
    id: any,
  ): Promise<ApplicationResponse> {
    const item = await this.applicationRepository.findOne(id, [], true);
    return ApplicationResponse.toResponse(item);
  }
  async getOneByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<ApplicationResponse> {
    const response = await this.applicationRepository.getOneByCriteria(
      criteria,
      relations,
      withDeleted,
    );
    return ApplicationResponse.toResponse(response);
  }
  async getManyByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<ApplicationResponse[]> {
    const response = await this.applicationRepository.getManyByCriteria(
      criteria,
      relations,
      withDeleted,
    );
    return response.map((item) => ApplicationResponse.toResponse(item));
  }
  async createApplication(
    command: CreateApplicationCommand,
    file?: Express.Multer.File,
  ) {
    const jobPost = await this.jobPostingRepository.findOne(command.JobPostId);
    if (!jobPost)
      throw new ConflictException(`You already applied for this job`);
    const userInfo = await this.userService.findOne(command.userId);
    const count = jobPost.applicationCount + 1;
    const applicationAlreadyExists =
      await this.applicationRepository.getOneByCriteria({
        JobPostId: command.JobPostId,
        userId: command.userId,
      });
    if (applicationAlreadyExists)
      throw new ConflictException(`You already applied for this job`);
    let res: FileDto = null;
    const applicationEntity = CreateApplicationCommand.fromDto(command);

    if (file) {
      const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
      const fileName = file.originalname;
      const fileId = `${command.userId}/${randomNumber}_${fileName}`;
      res = await this.fileService.uploadAttachment(fileId, file);
      if (!res) throw new BadRequestException('file upload failed');
      applicationEntity.cv = res;
    } else {
      if (!userInfo.resume) {
        throw new BadRequestException(
          `Either you have to send Resume or there must be one on the user profile`,
        );
      }
      applicationEntity.cv = userInfo.resume;
    }
    applicationEntity.userInfo = userInfo;
    const result = await this.applicationRepository.create(applicationEntity);
    await this.jobPostingRepository.update(jobPost.id, {
      applicationCount: count,
    });
    const response = ApplicationResponse.toResponse(result);
    return response;
  }
  async updateApplicationStatus(command: ChangeApplicationStatus) {
    const application = await this.applicationRepository.findOne(command.id);
    if (!application)
      throw new NotFoundException(
        `Application with id ${command.id} not found`,
      );

    application.status = command.status;
    await this.applicationRepository.update(application.id, application);
    return true;
  }
  async PrepareAndSendEmail(command: PrepareScheduleCommand) {
    const shorlistedApplications =
      await this.applicationRepository.getManyByCriteria(
        {
          // status: ApplicationStatusEnums.SELECTED,
          JobPostId: command.jobPostId,
        },
        ['user'],
      );
    if (shorlistedApplications?.length > 0) {
      const Schedules = await this.generateSchedule(
        command.oneInterviewDuration,
        command.numberOfInterviewingGroup,
        shorlistedApplications,
      );
      return Schedules;
    } else {
      return null;
    }
  }
  generateSchedule(
    interviewDuration: number,
    teamCount: number,
    applications: ApplicationEntity[],
  ): ScheduledInterview[] {
    const schedule: ScheduledInterview[] = [];
    const baseDate = new Date();
    baseDate.setUTCHours(0, 0, 0, 0); // Start of today in UTC

    const workStartUTC = new Date(baseDate);
    workStartUTC.setUTCHours(0, 0, 0, 0); // 3:00 ET == 00:00 UTC

    const workEndUTC = new Date(baseDate);
    workEndUTC.setUTCHours(8, 30, 0, 0); // 11:30 ET == 08:30 UTC

    const breakStartUTC = new Date(baseDate);
    breakStartUTC.setUTCHours(3, 0, 0, 0); // 6:00 ET == 03:00 UTC

    const breakEndUTC = new Date(baseDate);
    breakEndUTC.setUTCHours(4, 30, 0, 0); // 7:30 ET == 04:30 UTC

    let current = new Date(workStartUTC);
    let index = 0;

    while (
      index < applications.length &&
      current.getTime() < workEndUTC.getTime()
    ) {
      const slotEnd = new Date(current.getTime() + interviewDuration * 60000);

      // If interview overlaps with break, move to after break
      if (slotEnd > breakStartUTC && current < breakEndUTC) {
        current = new Date(breakEndUTC);
        continue;
      }

      // If beyond working hour, stop
      if (slotEnd > workEndUTC) break;

      for (
        let team = 1;
        team <= teamCount && index < applications.length;
        team++
      ) {
        schedule.push({
          jobPostId: applications[index++].JobPostId,
          user: applications[index++]?.userInfo,
          startTime: this.toEthiopianTime(current),
          endTime: this.toEthiopianTime(slotEnd),
          team,
        });
      }

      current = new Date(current.getTime() + interviewDuration * 60000);
    }

    return schedule;
  }

  private toEthiopianTime(date: Date): string {
    const etDate = new Date(date.getTime() + 3 * 60 * 60 * 1000); // UTC+3
    return etDate.toISOString().substring(11, 16); // HH:mm
  }
}
interface ScheduledInterview {
  user: UserEntity;
  jobPostId: string;
  startTime: string; // ET in HH:mm
  endTime: string; // ET in HH:mm
  team: number;
}

/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { SaveJobEntity } from '../persistencies/save-job-post.entity';
import {
  CreateSavedJobsCommand,
  UnsaveJobPostCommand,
} from './saved-jobs.command';
@Injectable()
export class SavedJobsService extends CommonCrudService<SaveJobEntity> {
  constructor(
    @InjectRepository(SaveJobEntity)
    private readonly saveJobRepository: Repository<SaveJobEntity>,
  ) {
    super(saveJobRepository);
  }
  async saveJobPost(command: CreateSavedJobsCommand) {
    const saveJobPostEntity = CreateSavedJobsCommand.fromDto(command);
    const rsult = await this.create(saveJobPostEntity);
  }
  async unsaveJobPost(command: UnsaveJobPostCommand) {
    const jobPostExists = await this.saveJobRepository.findOne({
      where: { userId: command.userId, jobPostId: command.jobPostId },
    });
    if (!jobPostExists) throw new NotFoundException(`Job post does not exist`);
    const result = await this.saveJobRepository.delete(jobPostExists.id);
    return result.affected > 0;
  }
}

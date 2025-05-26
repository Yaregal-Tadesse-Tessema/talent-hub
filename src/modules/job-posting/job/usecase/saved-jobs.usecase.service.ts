/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateSavedJobsCommand,
  UnsaveJobPostCommand,
} from './saved-jobs.command';
import { SaveJobPostingRepository } from '../persistencies/save-job-post.repository';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
@Injectable()
export class SavedJobsService {
  constructor(private readonly saveJobRepository: SaveJobPostingRepository) {}
  async saveJobPost(command: CreateSavedJobsCommand) {
    const saveJobPostEntity = CreateSavedJobsCommand.fromDto(command);
    const result = await this.saveJobRepository.create(saveJobPostEntity);
    return result;
  }
  async unsaveJobPost(command: UnsaveJobPostCommand) {
    const jobPostExists = await this.saveJobRepository.getOneByCriteria({
      userId: command.userId,
      jobPostId: command.jobPostId,
    });
    if (!jobPostExists) throw new NotFoundException(`Job post does not exist`);
    const result = await this.saveJobRepository.softDelete(jobPostExists.id);
    return result.affected > 0;
  }
  async getSavedJobPost(query: CollectionQuery) {
    const jobPostExists = await this.saveJobRepository.findAll(query);
    return jobPostExists;
  }
}

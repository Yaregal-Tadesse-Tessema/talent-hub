/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import {
  CreateSavedJobsCommand,
  UnsaveJobPostCommand,
} from './saved-jobs.command';
import { SaveJobPostingRepository } from '../persistencies/save-job-post.repository';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { SavedJobsResponse } from './saved-jobs.response';
@Injectable()
export class SavedJobsService {
  constructor(private readonly saveJobRepository: SaveJobPostingRepository) {}
  async saveJobPost(command: CreateSavedJobsCommand) {
    const existingSave = await this.saveJobRepository.getOneByCriteria({
      userId: command.userId,
      jobPostId: command.jobPostId,
    });
    if (existingSave) {
      return SavedJobsResponse.toResponse(existingSave);
    }
    const saveJobPostEntity = CreateSavedJobsCommand.fromDto(command);
    const result = await this.saveJobRepository.create(saveJobPostEntity);
    return SavedJobsResponse.toResponse(result);
  }
  async unsaveJobPost(command: UnsaveJobPostCommand) {
    const jobPostExists = await this.saveJobRepository.getOneByCriteria({
      userId: command.userId,
      jobPostId: command.jobPostId,
    });
    
    if (!jobPostExists) {
      throw new NotFoundException(`Job post is not saved by this user`);
    }
    const result = await this.saveJobRepository.softDelete(jobPostExists.id);
    return result
  }
  async deletesaveJobPost(id: string) {
    const jobPostExists = await this.saveJobRepository.getOneByCriteria({
      id: id,
    });
    
    if (!jobPostExists) {
      throw new NotFoundException(`Job post is not saved by this user`);
    }
    const result = await this.saveJobRepository.delete(jobPostExists.id);
    return result
  }
  async getSavedJobPost(query: CollectionQuery) {
    const jobPostExists = await this.saveJobRepository.findAll(query);
    return jobPostExists;
  }
}

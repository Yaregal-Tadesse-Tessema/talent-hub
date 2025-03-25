/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { SaveJobEntity } from '../persistencies/save-job-post.entity';
import { CreateSavedJobsCommand } from './saved-jobs.command';
@Injectable()
export class SavedJobsService extends CommonCrudService<SaveJobEntity> {
  constructor(
    @InjectRepository(SaveJobEntity)
    private readonly saveJobEntity: Repository<SaveJobEntity>,
  ) {
    super(saveJobEntity);
  }
  async saveJobPost(command: CreateSavedJobsCommand) {
    const saveJobPostEntity = CreateSavedJobsCommand.fromDto(command);
    const rsult = await this.create(saveJobPostEntity);
  }
}

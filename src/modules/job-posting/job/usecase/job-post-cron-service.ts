/* eslint-disable prettier/prettier */
// my-cron.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobPostingRepository } from '../persistencies/job-post.repository';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { JobPostingStatusEnums } from '../../constants';
import { console } from 'inspector';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPostingEntity } from '../persistencies/job-posting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MyCronService implements OnModuleInit{
  private readonly logger = new Logger(MyCronService.name);
  constructor(
    @InjectRepository(JobPostingEntity)
    private readonly jobPostingRepository: Repository<JobPostingEntity>,

  ) {}
   onModuleInit() {
    this.logger.log('MyCronService initialized');
  }
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    const query: CollectionQuery = new CollectionQuery();
    query.where.push([
      { column: 'status', operator: '=', value: JobPostingStatusEnums.POSTED },
    ]);
    const applications = await this.jobPostingRepository.find();
    const datas = applications;
    if (applications.length > 0) {
      for (let index = 0; index < datas.length; index++) {
        const data = datas[index];

        if (data.deadline < new Date()) {
          const result = await this.jobPostingRepository.update(data.id, {
            status: JobPostingStatusEnums.EXPIRED,
          });
          console.log(result);
        }
      }
    }
  }
}

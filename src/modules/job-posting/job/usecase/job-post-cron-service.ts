/* eslint-disable prettier/prettier */
// my-cron.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobPostingRepository } from '../persistencies/job-post.repository';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { JobPostingStatusEnums } from '../../constants';
import { console } from 'inspector';

@Injectable()
export class MyCronService implements OnModuleInit{
  private readonly logger = new Logger(MyCronService.name);
  constructor(private readonly jobPostingRepository: JobPostingRepository) {}
   onModuleInit() {
    this.logger.log('MyCronService initialized');
  }
  // This will run at midnight (00:00) every day
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    const query: CollectionQuery = new CollectionQuery();
    query.where.push([
      { column: 'status', operator: '=', value: JobPostingStatusEnums.POSTED },
    ]);
    const applications = await this.jobPostingRepository.findAll(query);
    const datas = applications.items;
    if (applications.total > 0) {
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

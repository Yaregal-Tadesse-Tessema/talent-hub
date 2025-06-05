/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostingEntity } from './job/persistencies/job-posting.entity';
import { JobPostingController } from './job/controller/job-posting.controller';
import { UserEntity } from '../user/persistence/users.entity';
import { SaveJobEntity } from './job/persistencies/save-job-post.entity';
import { SavedJobsService } from './job/usecase/saved-jobs.usecase.service';
import { SaveJobController } from './job/controller/saved-jobs.controller';
import { PreScreeningQuestionEntity } from './job/persistencies/pre-screening-question.entity';
import { PreScreeningQuestionService } from './job/usecase/pre-screening-question/pre-screening-question.usecase.command';
import { PreScreeningQuestionController } from './job/controller/pre-screening-question.controller';
import { TestController } from './job/controller/test.controller';
import { UserModule } from '../user/user.module';
import { JobPostingService } from './job/usecase/job-posting.usecase.service';
import { JobPostingRepository } from './job/persistencies/job-post.repository';
import { TelegramModule } from '../telegram/telegram.module';
import { PreScreeningQuestionRepository } from './job/persistencies/pre-screening-question.repository';
import { SaveJobPostingRepository } from './job/persistencies/save-job-post.repository';
import { MyCronService } from './job/usecase/job-post-cron-service';
import { UserFavoriteJobEntity } from './job/persistencies/user-favorite-job.entity';
import { UserFavoriteJobRepository } from './job/persistencies/user-favorite-job.repository';
import { UserFavoriteJobService } from './job/usecase/user-favorite-job.usecase.service';
import { UserFavoriteJobController } from './job/controller/user-favorite-job.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserFavoriteJobEntity,
      JobPostingEntity,
      UserEntity,
      SaveJobEntity,
      PreScreeningQuestionEntity,
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => TelegramModule),
    // UserModule,
  ],
  providers: [
    JobPostingService,
    JobPostingRepository,

    SavedJobsService,
    SaveJobPostingRepository,

    PreScreeningQuestionService,
    PreScreeningQuestionRepository,

    MyCronService,

    UserFavoriteJobRepository,
    UserFavoriteJobService,
  ],
  controllers: [
    JobPostingController,
    SaveJobController,
    PreScreeningQuestionController,
    TestController,
    UserFavoriteJobController,
  ],
  exports: [JobPostingService, JobPostingRepository],
})
export class JobPostingModule {}

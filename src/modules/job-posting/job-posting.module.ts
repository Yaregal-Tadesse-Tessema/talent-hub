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
import { UserService } from '../user/usecase/user.usecase.service';
import { ApplicationModule } from '../application/application.module';
import { PositionEntity } from './job/persistencies/position.entity';
import { PositionRepository } from './job/persistencies/position.repository';
import { PositionService } from './job/usecase/position.usecase.service';
import { PositionController } from './job/controller/position.controller';
import { IndustryEntity } from './job/persistencies/industry.entity';
import { IndustryRepository } from './job/persistencies/industry.repository';
import { IndustryService } from './job/usecase/industry.usecase.service';
import { IndustryController } from './job/controller/industry.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserFavoriteJobEntity,
      JobPostingEntity,
      UserEntity,
      SaveJobEntity,
      PreScreeningQuestionEntity,
      PositionEntity,
      IndustryEntity,
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => TelegramModule),
    forwardRef(() => ApplicationModule),
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

    PositionRepository,
    PositionService,

    IndustryRepository,
    IndustryService,

    UserService
  ],
  controllers: [
    JobPostingController,
    SaveJobController,
    PreScreeningQuestionController,
    UserFavoriteJobController,
    PositionController,
    IndustryController,
  ],
  exports: [JobPostingService, JobPostingRepository, UserService, PositionService, IndustryService],
})
export class JobPostingModule {}

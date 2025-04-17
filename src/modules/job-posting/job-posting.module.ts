/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostingEntity } from './job/persistencies/job-posting.entity';
import { JobRequirementEntity } from './job-requirement/persistance/job-requirement.entity';
import { JobPostingService } from './job/usecase/job-posting.usecase.service';
import { JobRequirementService } from './job-requirement/usecase/job-requirement.usecase.service';
import { JobPostingController } from './job/controller/job-posting.controller';
import { TelegramModule } from '../telegram/telegram.module';
import { UserEntity } from '../user/persistence/users.entity';
import { SaveJobEntity } from './job/persistencies/save-job-post.entity';
import { SavedJobsService } from './job/usecase/saved-jobs.usecase.service';
import { SaveJobController } from './job/controller/saved-jobs.controller';
import { PreScreeningQuestionEntity } from './job/persistencies/pre-screening-question.entity';
import { PreScreeningQuestionService } from './job/usecase/pre-screening-question/pre-screening-question.usecase.command';
import { PreScreeningQuestionController } from './job/controller/pre-screening-question.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobPostingEntity,
      JobRequirementEntity,
      UserEntity,
      SaveJobEntity,
      PreScreeningQuestionEntity,
    ]),
    // forwardRef(() => TelegramModule),
  ],
  providers: [
    JobPostingService,
    JobRequirementService,
    SavedJobsService,
    PreScreeningQuestionService,
  ],
  controllers: [
    JobPostingController,
    SaveJobController,
    PreScreeningQuestionController,
  ],
  exports: [JobPostingService],
})
export class JobPostingModule {}

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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobPostingEntity,
      JobRequirementEntity,
      UserEntity,
    ]),
    forwardRef(() => TelegramModule),
  ],
  providers: [JobPostingService, JobRequirementService],
  controllers: [JobPostingController],
  exports: [JobPostingService],
})
export class JobPostingModule {}

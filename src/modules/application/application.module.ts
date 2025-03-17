/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationEntity } from './persistences/application.entity';
import { ApplicationController } from './controller/application.controller';
import { ApplicationService } from './usecase/application.usecase.service';
import { FileModule } from '../file/file.module';
import { JobPostingModule } from '../job-posting/job-posting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity]),
    FileModule,
    forwardRef(() => JobPostingModule),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}

/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationEntity } from './persistences/application.entity';
import { ApplicationController } from './controller/application.controller';
import { FileModule } from '../file/file.module';
import { JobPostingModule } from '../job-posting/job-posting.module';
import { UserModule } from '../user/user.module';
import { ApplicationService } from './usecase/application.usecase.service';
import { ApplicationRepository } from './persistences/application.repository';
import { MessageEntity } from '../notification/persistencies/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, MessageEntity]),
    FileModule,
    forwardRef(() => JobPostingModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService, ApplicationRepository],
  exports: [ApplicationService, ApplicationRepository],
})
export class ApplicationModule {}

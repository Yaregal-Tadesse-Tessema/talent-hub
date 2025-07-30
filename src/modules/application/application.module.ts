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
import { InvitationEntity } from './persistences/invitation.entity';
import { InvitationRepository } from './persistences/invitation.repository';
import { InvitationService } from './usecase/invitation/invitation.usecase.ervice';
import { InvitationController } from './controller/invitation.controller';
import { GeminiModule } from '../gemini/gemini.module';
import { UserService } from '../user/usecase/user.usecase.service';
import { UserEntity } from '../user/persistence/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationEntity,
      MessageEntity,
      InvitationEntity,
      UserEntity
    ]),
    FileModule,
    forwardRef(() => JobPostingModule),
    forwardRef(() => UserModule),
    GeminiModule,
  ],
  controllers: [ApplicationController, InvitationController],
  providers: [
    ApplicationService,
    ApplicationRepository,
    InvitationRepository,
    InvitationService,
    UserService
  ],
  exports: [ApplicationService, ApplicationRepository,UserService],
})
export class ApplicationModule {}

/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './persistence/users.entity';
import { UserService } from './usecase/user.usecase.service';
import { UserController } from './controller/user.controller';
import { PdfService } from 'src/libs/pdf/pdf.service';
import { ApplicationEntity } from '../application/persistences/application.entity';
import { SaveJobEntity } from '../job-posting/job/persistencies/save-job-post.entity';
import { ApplicationModule } from '../application/application.module';
import { UserRepository } from './persistence/user.repository';
import { UserFavoriteJobEntity } from '../job-posting/job/persistencies/user-favorite-job.entity';
import { NotificationEntity } from '../notification/persistencies/notification.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ApplicationEntity,
      SaveJobEntity,
      UserFavoriteJobEntity,
      NotificationEntity,
    ]),
    forwardRef(() => ApplicationModule),
  ],
  providers: [UserService, UserRepository, PdfService],
  controllers: [UserController],
  exports: [UserService, UserRepository],
})
export class UserModule {}


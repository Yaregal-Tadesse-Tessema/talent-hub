/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './persistence/users.entity';
import { UserService } from './usecase/user.usecase.service';
import { UserController } from './controller/user.controller';
import { EducationController } from './controller/education.controller';
import { ExperiencesController } from './controller/experience.controller';
import { EducationEntity } from './persistence/education.entity';
import { ExperienceEntity } from './persistence/experience.entity';
import { EducationService } from './usecase/education.usecase.service';
import { ExperienceService } from './usecase/experience.usecase.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, EducationEntity, ExperienceEntity]),
  ],
  providers: [UserService, EducationService, ExperienceService],
  controllers: [UserController, EducationController, ExperiencesController],
  exports: [UserService],
})
export class UserModule {}


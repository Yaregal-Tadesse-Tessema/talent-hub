/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationEntity } from './persistences/application.entity';
import { ApplicationController } from './controller/application.controller';
import { ApplicationService } from './usecase/application.usecase.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
        ApplicationEntity
    ]),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [],
})
export class ApplicationModule {}

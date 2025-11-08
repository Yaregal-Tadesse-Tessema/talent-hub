/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalTaskEntity } from './persistencies/approval-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalTaskEntity])],
  exports: [TypeOrmModule],
})
export class TasksModule {}



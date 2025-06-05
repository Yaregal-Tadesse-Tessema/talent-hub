/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserFavoriteJobEntity } from 'src/modules/job-posting/job/persistencies/user-favorite-job.entity';
export class CreateUserFavoriteJobCommand {
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
  jobPostId: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  remark: string;
  currentUser?: any;
  static fromCommand(command: CreateUserFavoriteJobCommand): UserFavoriteJobEntity {
    const entity = new UserFavoriteJobEntity();
    entity.id = command?.id;
    entity.jobPostId = command.jobPostId;
    entity.userId = command.userId;
    return entity;
  }
}
export class UpdateUserFavoriteJobCommand extends CreateUserFavoriteJobCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}
export class ArchiveUserFavoriteJobCommand {
  @ApiProperty({
    example: 'uuid',
  })
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  reason: string;
  currentUser: any;
}
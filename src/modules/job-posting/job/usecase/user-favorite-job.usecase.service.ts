/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { UserFavoriteJobRepository } from '../persistencies/user-favorite-job.repository';
import {
  CreateUserFavoriteJobCommand,
  UpdateUserFavoriteJobCommand,
} from './user-favorite-job.command';
import { UserFavoriteJobResponse } from './user-favorite-job.response';

@Injectable()
export class UserFavoriteJobService {
  constructor(
    private readonly userFavoriteJobRepository: UserFavoriteJobRepository,
  ) {}

  async getAll(query: CollectionQuery) {
    return await this.userFavoriteJobRepository.findAll(query);
  }
  async getById(id: string) {
    return await this.userFavoriteJobRepository.findOne(id);
  }
  async getCount(query: CollectionQuery) {
    return await this.userFavoriteJobRepository.getCount(query);
  }
  async createUserFavoriteJob(command: CreateUserFavoriteJobCommand) {
    const alreadyFavorite =
      await this.userFavoriteJobRepository.getOneByCriteria({
        userId: command.userId,
        jobPostId: command.jobPostId,
      });
    if (alreadyFavorite)
      throw new BadRequestException(`This job is already favorite for you`);
    const userTenant = await this.userFavoriteJobRepository.create(command);
    return UserFavoriteJobResponse.toResponse(userTenant);
  }
  async updateUserFavoriteJob(command: UpdateUserFavoriteJobCommand) {
    const lookup = await this.userFavoriteJobRepository.findOne(command.id);
    if (!lookup)
      throw new NotFoundException('User favorite job does not exist');
    return await this.userFavoriteJobRepository.update(command.id, command);
  }
  async archive(id: string) {
    const lookup = await this.userFavoriteJobRepository.findOne(id);
    if (!lookup) throw new NotFoundException('Favorite job does not exist');
    const result = await this.userFavoriteJobRepository.softDelete(id);
    return result.affected > 0 ? true : false;
  }
  async delete(id: string) {
    const result = await this.userFavoriteJobRepository.delete(id);
    return result.affected > 0 ? true : false;
  }
  async restore(id: string) {
    await this.userFavoriteJobRepository.restore(id);
    return true;
  }
}

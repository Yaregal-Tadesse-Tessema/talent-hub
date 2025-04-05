/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { FileService } from 'src/modules/file/services/file.service';
import { UserResponse } from './user.response';
import { UserRepository } from '../persistence/users.repository';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileService: FileService,
  ) {}
  async getProfileCompleteness(id: string): Promise<{ percentage: number }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return { percentage: 0 };
    }
    // Define fields and their weights
    const fieldsWithWeights = [
      { key: 'phone', weight: 20 },
      { key: 'email', weight: 20 },
      { key: 'firstName', weight: 20 },
      { key: 'lastName', weight: 20 },
      { key: 'highestLevelOfEducation', weight: 20 },
      { key: 'industry', weight: 20 },
      { key: 'yearOfExperience', weight: 15 },
      { key: 'preferredJobLocation', weight: 15 },
      { key: 'gpa', weight: 15 },
      { key: 'salaryExpectations', weight: 15 },
      { key: 'linkedinUrl', weight: 10 },
      { key: 'portfolioUrl', weight: 10 },
      { key: 'aiGeneratedJobFitScore', weight: 10 },
      { key: 'birthDate', weight: 10 },
      { key: 'middleName', weight: 5 },
      { key: 'gender', weight: 5 },
      { key: 'profile', weight: 5 },
    ];

    // Calculate total score
    let filledScore = 0;
    let totalWeight = 0;

    for (const field of fieldsWithWeights) {
      totalWeight += field.weight;
      if (
        user[field.key] &&
        (Array.isArray(user[field.key]) ? user[field.key].length > 0 : true)
      ) {
        filledScore += field.weight;
      }
    }

    // Calculate percentage
    const percentage = Math.round((filledScore / totalWeight) * 100);

    return { percentage };
  }
  async uploadProfile(file: Express.Multer.File, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user)
      throw new BadRequestException(`User with id ${userId} doesn't exist`);
    if (user.resume) {
      const res = await this.fileService.deleteBucketFile(user.resume.path);
    }
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const fileName = file.originalname;
    const fileId = `${userId}/${randomNumber}_${fileName}`;
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    user.profile = res;
    const response = await this.userRepository.create(user);
    return UserResponse.toResponse(response);
  }
  async uploadResume(file: Express.Multer.File, telegramUserId: string) {
    const user = await this.userRepository.findOne({
      where: { telegramUserId: telegramUserId },
    });
    if (!user)
      throw new BadRequestException(
        `User with id ${telegramUserId} doesn't exist`,
      );

    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const fileName = file.originalname;
    const fileId = `${user.id}/Resume/${randomNumber}_${fileName}`;
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    user.resume = res;
    const response = await this.userRepository.create(user);
    return UserResponse.toResponse(response);
  }
}

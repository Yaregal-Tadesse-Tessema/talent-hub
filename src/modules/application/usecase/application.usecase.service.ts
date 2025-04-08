/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { ApplicationEntity } from '../persistences/application.entity';
import { CreateApplicationCommand } from './application.command';
import { ApplicationResponse } from './application.response';
import { FileService } from 'src/modules/file/services/file.service';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { JobPostingService } from 'src/modules/job-posting/job/usecase/job-posting.usecase.service';
import { UserService } from 'src/modules/user/usecase/user.usecase.service';
@Injectable()
export class ApplicationService extends CommonCrudService<ApplicationEntity> {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @Inject(forwardRef(() => JobPostingService))
    private jobPostingService: JobPostingService,
    private readonly fileService: FileService,
    private readonly userService: UserService,
  ) {
    super(applicationRepository);
  }

  async createApplication(
    command: CreateApplicationCommand,
    file?: Express.Multer.File,
  ) {
    const jobPost = await this.jobPostingService.findOne(command.JobPostId);
    if (!jobPost)
      throw new ConflictException(`You already applied for this job`);
    const userInfo = await this.userService.findOne(command.userId);
    const count = jobPost.applicationCount + 1;
    const applicationAlreadyExists = await this.applicationRepository.findOne({
      where: { JobPostId: command.JobPostId, userId: command.userId },
    });
    if (applicationAlreadyExists)
      throw new ConflictException(`You already applied for this job`);
    let res: FileDto = null;
    if (file) {
      const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
      const fileName = file.originalname;
      const fileId = `${command.userId}/${randomNumber}_${fileName}`;
      res = await this.fileService.uploadAttachment(fileId, file);
      if (!res) throw new BadRequestException('file upload failed');
    }
    const applicationEntity = CreateApplicationCommand.fromDto(command);
    applicationEntity.cv = res;
    applicationEntity.userInfo = userInfo;
    const result = await this.applicationRepository.save(applicationEntity);
    const respons = await this.jobPostingService.update(jobPost.id, {
      applicationCount: count,
    });
    const response = ApplicationResponse.toResponse(result);
    return response;
  }
}

/* eslint-disable prettier/prettier */
import {
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { ApplicationEntity } from '../persistences/application.entity';
import { FileService } from 'src/modules/file/services/file.service';
import { UserService } from 'src/modules/user/usecase/user.usecase.service';
import { JobPostingService } from 'src/modules/job-posting/job/usecase/job-posting.usecase.service';
@Injectable()
export class ApplicationServiceOld extends CommonCrudService<ApplicationEntity> {
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

 
}

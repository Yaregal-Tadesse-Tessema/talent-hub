/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { ApplicationEntity } from '../persistences/application.entity';
import { CreateApplicationCommand } from './application.command';
import { ApplicationResponse } from './application.response';
import { FileService } from 'src/modules/file/services/file.service';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
@Injectable()
export class ApplicationService extends CommonCrudService<ApplicationEntity> {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly fileService: FileService,
  ) {
    super(applicationRepository);
  }

  async createApplication(
    command: CreateApplicationCommand,
    file?: Express.Multer.File,
  ) {
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
    const result = await this.applicationRepository.save(applicationEntity);
    const response = ApplicationResponse.toResponse(result);
    return response;
  }
}

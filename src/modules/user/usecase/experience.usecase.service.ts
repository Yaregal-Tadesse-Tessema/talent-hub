/* eslint-disable prettier/prettier */
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { FileService } from 'src/modules/file/services/file.service';
import { ExperienceEntity } from '../persistence/experience.entity';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
export class ExperienceService extends CommonCrudService<ExperienceEntity> {
  constructor(
    @InjectRepository(ExperienceEntity)
    private readonly experienceRepository: Repository<ExperienceEntity>,
    private readonly fileService: FileService,
    @Inject(REQUEST) request?: Request,
  ) {
    super(experienceRepository, request);
  }
}

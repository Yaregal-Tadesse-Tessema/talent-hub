/* eslint-disable prettier/prettier */
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { FileService } from 'src/modules/file/services/file.service';
import { EducationEntity } from '../persistence/education.entity';
import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
@Injectable()
export class EducationService extends CommonCrudService<EducationEntity> {
  constructor(
    @InjectRepository(EducationEntity)
    private readonly educationRepository: Repository<EducationEntity>,
    private readonly fileService: FileService,
    @Inject(REQUEST) request?: Request,
  ) {
    super(educationRepository, request);
  }
}

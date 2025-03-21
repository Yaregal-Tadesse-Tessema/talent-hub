/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { PreScreeningQuestionEntity } from '../../persistencies/pre-screening-question.entity';
@Injectable()
export class PreScreeningQuestionService extends CommonCrudService<PreScreeningQuestionEntity> {
  constructor(
    @InjectRepository(PreScreeningQuestionEntity)
    private readonly preScreeningQuestionRepository: Repository<PreScreeningQuestionEntity>,
  ) {
    super(preScreeningQuestionRepository);
  }
}

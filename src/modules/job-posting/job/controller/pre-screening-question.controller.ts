/* eslint-disable prettier/prettier */
import { Controller} from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { PreScreeningQuestionEntity } from '../persistencies/pre-screening-question.entity';
import { PreScreeningQuestionService } from '../usecase/pre-screening-question/pre-screening-question.usecase.command';
import { CreatePreScreeningQuestionCommand, UpdatePreScreeningQuestionCommand } from '../usecase/pre-screening-question/pre-screening-question.command';
import { PreScreeningQuestionResponse } from '../usecase/pre-screening-question/pre-screening-question.response';
const options: EntityCrudOptions = {
  createDto: CreatePreScreeningQuestionCommand,
  updateDto: UpdatePreScreeningQuestionCommand,
  responseFormat: PreScreeningQuestionResponse,
};
@Controller('pre-screening-questions')
@ApiTags('pre-screening-questions')
@ApiExtraModels(DataResponseFormat)
export class PreScreeningQuestionController extends CommonCrudController<PreScreeningQuestionEntity>(
  options,
) {
  constructor(private readonly preScreeningQuestionService: PreScreeningQuestionService) {
    super(preScreeningQuestionService);
  }
}

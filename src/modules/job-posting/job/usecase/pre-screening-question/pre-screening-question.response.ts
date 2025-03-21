/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { PreScreeningQuestionEntity } from '../../persistencies/pre-screening-question.entity';
export class PreScreeningQuestionResponse {
  id?: string;
  @ApiProperty()
  jobPostId: number;
  @ApiProperty()
  question: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  options: string[];
  @ApiProperty()
  isKnockout: boolean;
  @ApiProperty()
  weight: number;
  @ApiProperty()
  booleanAnswer: boolean;
  @ApiProperty()
  selectedOptions: string[];
  @ApiProperty()
  essayAnswer: string;
  @ApiProperty()
  score: number;

  static fromDto(entity: PreScreeningQuestionEntity):  PreScreeningQuestionResponse{
    const response = new PreScreeningQuestionResponse();
    if (!entity) {
      return null;
    }
    response.id = entity?.id;
    response.jobPostId = entity.jobPostId;
    response.question = entity.question;
    response.type = entity.type;
    response.options = entity.options;
    response.isKnockout = entity.isKnockout;
    response.weight = entity.weight;
    response.booleanAnswer = entity.booleanAnswer;
    response.selectedOptions = entity.selectedOptions;
    response.essayAnswer = entity.essayAnswer;
    response.score = entity.score;
    return response;
  }
}


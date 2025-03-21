/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { PreScreeningQuestionEntity } from '../../persistencies/pre-screening-question.entity';
export class CreatePreScreeningQuestionCommand {
  id?: string;
  @ApiProperty()
  jobPostId: string;
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

  static fromDto(
    dto: CreatePreScreeningQuestionCommand,
  ): PreScreeningQuestionEntity {
    const entity = new PreScreeningQuestionEntity();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.jobPostId = dto.jobPostId;
    entity.question = dto.question;
    entity.type = dto.type;
    entity.options = dto.options;
    entity.isKnockout = dto.isKnockout;
    entity.weight = dto.weight;
    entity.booleanAnswer = dto.booleanAnswer;
    entity.selectedOptions = dto.selectedOptions;
    entity.essayAnswer = dto.essayAnswer;
    entity.score = dto.score;
    return entity;
  }
  static fromDtos(
    dto: CreatePreScreeningQuestionCommand[],
  ): PreScreeningQuestionEntity[] {
    return dto?.map((d) => CreatePreScreeningQuestionCommand.fromDto(d));
  }
}
export class UpdatePreScreeningQuestionCommand extends CreatePreScreeningQuestionCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

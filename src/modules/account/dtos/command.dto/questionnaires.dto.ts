/* eslint-disable prettier/prettier */
// /* eslint-disable prettier/prettier */
// import { ApiProperty } from '@nestjs/swagger';

// export class UpdateSecurityQuestionnairesCommand {
//   @ApiProperty()
//   id: string;
//   @ApiProperty()
//   question?: string;
//   @ApiProperty()
//   answer?: string;
//   static fromCommands(
//     command: UpdateSecurityQuestionnairesCommand,
//   ): Questionnaires {
//     const questionnaires: Questionnaires = new Questionnaires();
//     questionnaires.id = command.id;
//     questionnaires.question = command?.question;
//     questionnaires.answer = command?.answer;
//     return questionnaires;
//   }
//   static toEntity(
//     command: UpdateSecurityQuestionnairesCommand,
//   ): SecurityQuestionsEntity {
//     const entity: SecurityQuestionsEntity = new SecurityQuestionsEntity();
//     entity.id = command?.id;
//     entity.question = command.question;
//     entity.answer = entity.answer;
//     return entity;
//   }
//   static toEntities(
//     command: UpdateSecurityQuestionnairesCommand[],
//   ): SecurityQuestionsEntity[] {
//     return command.map((item) => this.toEntity(item));
//   }
// }
// export class AddQuestionnairesToAccountCommand {
//   @ApiProperty()
//   questionId: string;
//   // @ApiProperty()
//   // question?: string;
//   @ApiProperty()
//   answer: string;
// }

// export class updateQuestionnairesToAccountCommand extends AddQuestionnairesToAccountCommand {
//   @ApiProperty()
//   id: string;
// }

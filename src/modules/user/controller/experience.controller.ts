/* eslint-disable prettier/prettier */
import {
  Controller,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { CreateExperienceCommand, UpdateExperienceCommand } from '../usecase/experience.command';
import { ExperienceResponse } from '../usecase/experience.response';
import { ExperienceEntity } from '../persistence/experience.entity';
import { ExperienceService } from '../usecase/experience.usecase.service';

const options: EntityCrudOptions = {
  createDto: CreateExperienceCommand,
  updateDto: UpdateExperienceCommand,
  responseFormat: ExperienceResponse,
};
@Controller('experiences')
@ApiTags('experiences')
@AllowAnonymous()
@ApiExtraModels(DataResponseFormat)
export class ExperiencesController extends CommonCrudController<ExperienceEntity>(options) {
  constructor(private readonly experienceService: ExperienceService) {
    super(experienceService);
  }
//   @Post('upload-profile/:userId')
//   @UseInterceptors(FileInterceptor('file'))
//   async createJobPosting(
//     @Param('userId') userId: string,
//     @UploadedFile() file: Express.Multer.File,
//   ) {
//     const result = await this.userService.uploadProfile(file, userId);
//     return result;
//   }

}

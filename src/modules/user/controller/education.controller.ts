/* eslint-disable prettier/prettier */
import {
  Controller,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { EntityCrudOptions } from 'src/libs/Common/common-services/crud-option.type';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { CommonCrudController } from 'src/libs/Common/common-services/common.controller';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { CreateEducationCommand, UpdateEducationCommand } from '../usecase/education.command';
import { EducationResponse } from '../usecase/education.response';
import { EducationEntity } from '../persistence/education.entity';
import { EducationService } from '../usecase/education.usecase.service';

const options: EntityCrudOptions = {
  createDto: CreateEducationCommand,
  updateDto: UpdateEducationCommand,
  responseFormat: EducationResponse,
};
@Controller('educations')
@ApiTags('educations')
@AllowAnonymous()
@ApiExtraModels(DataResponseFormat)
export class EducationController extends CommonCrudController<EducationEntity>(options) {
  constructor(private readonly educationService: EducationService) {
    super(educationService);
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

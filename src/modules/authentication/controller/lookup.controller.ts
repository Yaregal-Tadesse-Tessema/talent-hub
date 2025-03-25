/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { LookupService } from '../services/look-up.service';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { LookupResponse } from '../dtos/lookup.dto';

@Controller('lookups')
@ApiTags('lookups')
@ApiExtraModels(DataResponseFormat)
@AllowAnonymous()
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}
  @Get()
  @ApiOkResponse({ type: LookupResponse })
  async getAll() {
    return await this.lookupService.getAll();
  }
  @Get('/:id')
  @ApiOkResponse({ type: LookupResponse })
  async getOne(@Param('id') id: string) {
    return await this.lookupService.getById(id);
  }
}

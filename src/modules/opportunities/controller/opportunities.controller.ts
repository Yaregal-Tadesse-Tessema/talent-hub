/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { OpportunityService } from '../usecase/opportunity.service';
import {
  CreateOpportunityCommand,
  UpdateOpportunityCommand,
  OpportunityFilterDto,
} from '../usecase/opportunity.command';
import {
  OpportunityFullResponse,
  OpportunityPublicResponse,
  OpportunityListResponse,
} from '../usecase/opportunity.response';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';

@Controller('opportunities')
@ApiTags('opportunities')
@ApiExtraModels(DataResponseFormat, OpportunityPublicResponse, OpportunityFullResponse)
export class OpportunitiesController {
  constructor(private readonly opportunityService: OpportunityService) {}

  /**
   * Public endpoint: Get all opportunities (limited data)
   */
  @AllowAnonymous()
  @Get()
  @ApiOperation({ summary: 'Get all opportunities (public view)' })
  @ApiOkResponse({ type: OpportunityListResponse })
  async findAllPublic(
    @Query() filter: OpportunityFilterDto,
  ): Promise<OpportunityListResponse> {
    return await this.opportunityService.findAllPublic(filter);
  }

  /**
   * Public endpoint: Get featured opportunities
   */
  @AllowAnonymous()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured opportunities' })
  @ApiOkResponse({ type: [OpportunityPublicResponse] })
  async findFeatured(): Promise<OpportunityPublicResponse[]> {
    return await this.opportunityService.findFeatured();
  }

  /**
   * Public endpoint: Get opportunity by category
   */
  @AllowAnonymous()
  @Get('category/:category')
  @ApiOperation({ summary: 'Get opportunities by category' })
  @ApiOkResponse({ type: OpportunityListResponse })
  async findByCategory(
    @Param('category') category: string,
    @Query() filter: OpportunityFilterDto,
  ): Promise<OpportunityListResponse> {
    filter.category = category as any;
    return await this.opportunityService.findAllPublic(filter);
  }

  /**
   * Public endpoint: Get single opportunity (public view)
   */
  @AllowAnonymous()
  @Get(':id/public')
  @ApiOperation({ summary: 'Get opportunity public details' })
  @ApiOkResponse({ type: OpportunityPublicResponse })
  async findOnePublic(@Param('id') id: string): Promise<OpportunityPublicResponse> {
    return await this.opportunityService.findOnePublic(id);
  }

  /**
   * Authenticated endpoint: Get single opportunity (full details)
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get opportunity full details (authenticated)' })
  @ApiOkResponse({ type: OpportunityFullResponse })
  async findOne(@Param('id') id: string): Promise<OpportunityFullResponse> {
    return await this.opportunityService.findOne(id);
  }

  /**
   * Authenticated endpoint: Track view count
   */
  @Post(':id/view')
  @ApiOperation({ summary: 'Track opportunity view count' })
  async trackView(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.opportunityService.trackView(id);
    return { success: true };
  }

  /**
   * Admin endpoint: Create new opportunity
   */
  @Post()
  @ApiOperation({ summary: 'Create new opportunity (admin only)' })
  @ApiOkResponse({ type: OpportunityFullResponse })
  async create(
    @Body() command: CreateOpportunityCommand,
  ): Promise<OpportunityFullResponse> {
    return await this.opportunityService.create(command);
  }

  /**
   * Admin endpoint: Get all opportunities (admin view - full details)
   */
  @Get('admin/all')
  @ApiOperation({ summary: 'Get all opportunities (admin view)' })
  @ApiOkResponse({ type: DataResponseFormat })
  async findAll(
    @Query() filter: OpportunityFilterDto,
  ): Promise<DataResponseFormat<OpportunityFullResponse>> {
    return await this.opportunityService.findAll(filter);
  }

  /**
   * Admin endpoint: Update opportunity
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update opportunity (admin only)' })
  @ApiOkResponse({ type: OpportunityFullResponse })
  async update(
    @Param('id') id: string,
    @Body() command: UpdateOpportunityCommand,
  ): Promise<OpportunityFullResponse> {
    return await this.opportunityService.update(id, command);
  }

  /**
   * Admin endpoint: Delete opportunity
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete opportunity (admin only)' })
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.opportunityService.delete(id);
    return { success: true };
  }
}


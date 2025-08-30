/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery 
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt.auth.guard';
import { IndustryService } from '../usecase/industry.usecase.service';
import {
  CreateIndustryCommand,
  UpdateIndustryCommand,
  DeleteIndustryCommand,
} from '../usecase/industry.command';
import { IndustryResponse } from '../usecase/industry.response';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';

@ApiTags('Industries')
@Controller('industries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new industry',
    description: 'Creates a new industry with name and optional description'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Industry created successfully', 
    type: IndustryResponse 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Industry with same name already exists' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  async create(@Body() command: CreateIndustryCommand): Promise<IndustryResponse> {
    return await this.industryService.create(command);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all industries with optional filtering',
    description: 'Retrieves industries with support for pagination, filtering, and sorting'
  })
  @ApiQuery({ 
    name: 'q', 
    required: false, 
    description: 'Collection query string for filtering, pagination, and sorting' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Industries retrieved successfully', 
    type: DataResponseFormat<IndustryResponse> 
  })
  async findAll(@Query('q') q?: string): Promise<IndustryResponse[]> {
    const query = q ? JSON.parse(q) : new CollectionQuery();
    const industries = await this.industryService.findAll(query);
    return industries
  }

  @Get('active')
  @ApiOperation({ 
    summary: 'Get all active industries',
    description: 'Retrieves only active (non-deleted) industries ordered by name'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Active industries retrieved successfully', 
    type: [IndustryResponse] 
  })
  async findActiveIndustries(): Promise<IndustryResponse[]> {
    return await this.industryService.findActiveIndustries();
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Search industries by name',
    description: 'Searches for industries whose names contain the search term'
  })
  @ApiQuery({ 
    name: 'name', 
    required: true, 
    description: 'Search term for industry names' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully', 
    type: [IndustryResponse] 
  })
  async searchByName(@Query('name') name: string): Promise<IndustryResponse[]> {
    return await this.industryService.searchByName(name);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get an industry by ID',
    description: 'Retrieves a specific industry by its unique identifier'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Industry ID (UUID)', 
    type: 'string' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Industry retrieved successfully', 
    type: IndustryResponse 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Industry not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid ID format' 
  })
  async findOne(@Param('id') id: string): Promise<IndustryResponse> {
    return await this.industryService.findOne(id);
  }

  @Put()
  @ApiOperation({ 
    summary: 'Update an industry',
    description: 'Updates an existing industry with new name and/or description'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Industry updated successfully', 
    type: IndustryResponse 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Industry not found' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Industry with same name already exists' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  async update(@Body() command: UpdateIndustryCommand): Promise<IndustryResponse> {
    return await this.industryService.update(command);
  }

  @Delete()
  @ApiOperation({ 
    summary: 'Delete an industry',
    description: 'Soft deletes an industry (marks as deleted but keeps in database)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Industry deleted successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Industry not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid ID format' 
  })
  async delete(@Body() command: DeleteIndustryCommand): Promise<{ success: boolean; message: string }> {
    return await this.industryService.delete(command);
  }
}

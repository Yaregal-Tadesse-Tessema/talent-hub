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
import { PositionService } from '../usecase/position.usecase.service';
import {
  CreatePositionCommand,
  UpdatePositionCommand,
  DeletePositionCommand,
} from '../usecase/position.command';
import { PositionResponse } from '../usecase/position.response';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';

@ApiTags('Positions')
@Controller('positions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new position',
    description: 'Creates a new job position with name and optional description'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Position created successfully', 
    type: PositionResponse 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Position with same name already exists' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  async create(@Body() command: CreatePositionCommand): Promise<PositionResponse> {
    return await this.positionService.create(command);
  }
  @Post('bulk')
  @ApiOperation({ 
    summary: 'Create multiple positions',
    description: 'Creates multiple positions with name and optional description'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Positions created successfully', 
    type: [PositionResponse] 
  })
  async createMany(@Body() commands: CreatePositionCommand[]): Promise<PositionResponse[]> {
    return await this.positionService.createMany(commands);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all positions with optional filtering',
    description: 'Retrieves positions with support for pagination, filtering, and sorting'
  })
  @ApiQuery({ 
    name: 'q', 
    required: false, 
    description: 'Collection query string for filtering, pagination, and sorting' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Positions retrieved successfully', 
    type: DataResponseFormat<PositionResponse> 
  })
  async findAll(@Query('q') q?: string): Promise<DataResponseFormat<PositionResponse>> {
    const query = q ? JSON.parse(q) : new CollectionQuery();
    const positions = await this.positionService.findAll(query);
    return positions
  }

  @Get('active')
  @ApiOperation({ 
    summary: 'Get all active positions',
    description: 'Retrieves only active (non-deleted) positions ordered by name'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Active positions retrieved successfully', 
    type: [PositionResponse] 
  })
  async findActivePositions(): Promise<PositionResponse[]> {
    return await this.positionService.findActivePositions();
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Search positions by name',
    description: 'Searches for positions whose names contain the search term'
  })
  @ApiQuery({ 
    name: 'name', 
    required: true, 
    description: 'Search term for position names' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully', 
    type: [PositionResponse] 
  })
  async searchByName(@Query('name') name: string): Promise<PositionResponse[]> {
    return await this.positionService.searchByName(name);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a position by ID',
    description: 'Retrieves a specific position by its unique identifier'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Position ID (UUID)', 
    type: 'string' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Position retrieved successfully', 
    type: PositionResponse 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Position not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid ID format' 
  })
  async findOne(@Param('id') id: string): Promise<PositionResponse> {
    return await this.positionService.findOne(id);
  }

  @Put()
  @ApiOperation({ 
    summary: 'Update a position',
    description: 'Updates an existing position with new name and/or description'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Position updated successfully', 
    type: PositionResponse 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Position not found' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Position with same name already exists' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  async update(@Body() command: UpdatePositionCommand): Promise<PositionResponse> {
    return await this.positionService.update(command);
  }

  @Delete()
  @ApiOperation({ 
    summary: 'Delete a position',
    description: 'Soft deletes a position (marks as deleted but keeps in database)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Position deleted successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Position not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid ID format' 
  })
  async delete(@Body() command: DeletePositionCommand): Promise<{ success: boolean; message: string }> {
    return await this.positionService.delete(command);
  }
}

/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OpportunityRepository } from '../persistencies/opportunity.repository';
import {
  CreateOpportunityCommand,
  UpdateOpportunityCommand,
  OpportunityFilterDto,
} from './opportunity.command';
import {
  OpportunityFullResponse,
  OpportunityPublicResponse,
  OpportunityListResponse,
} from './opportunity.response';
import { OpportunityEntity } from '../persistencies/opportunity.entity';
import { OpportunityStatusEnum } from '../constants';
import { CollectionQuery, Where } from 'src/libs/Common/collection-query/query';
import { FilterOperators } from 'src/libs/Common/collection-query/filter_operators';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';

@Injectable()
export class OpportunityService {
  constructor(
    private readonly opportunityRepository: OpportunityRepository,
  ) {}

  /**
   * Validate summary ends with call-to-action
   */
  private validateSummary(summary: string): void {
    const ctaPatterns = [
      'login to explore',
      'login to access',
      'login to view',
      'login to see',
      'login to apply',
    ];
    const lowerSummary = summary.toLowerCase();
    const hasCTA = ctaPatterns.some((pattern) => lowerSummary.includes(pattern));
    
    if (!hasCTA) {
      throw new BadRequestException(
        'Summary must end with a call-to-action like "Login to explore full details and apply."',
      );
    }

    // Check word count (approximately 60 words)
    const wordCount = summary.split(/\s+/).length;
    if (wordCount > 60) {
      throw new BadRequestException(
        'Summary must not exceed 60 words',
      );
    }
  }

  /**
   * Validate deadline is in the future
   */
  private validateDeadline(deadline: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      throw new BadRequestException('Deadline must be a future date');
    }
  }

  /**
   * Create a new opportunity
   */
  async create(command: CreateOpportunityCommand): Promise<OpportunityFullResponse> {
    // Validate summary
    this.validateSummary(command.summary);

    // Validate deadline
    const deadline = new Date(command.deadline);
    this.validateDeadline(deadline);

    const entity = new OpportunityEntity();
    entity.category = command.category;
    entity.title = command.title;
    entity.organizer = command.organizer;
    entity.summary = command.summary;
    entity.eligibility = command.eligibility;
    entity.requirements = command.requirements;
    entity.benefits = command.benefits;
    entity.deadline = deadline;
    entity.eventDate = command.eventDate ? new Date(command.eventDate) : null;
    entity.officialLink = command.officialLink;
    entity.location = command.location;
    entity.locationType = command.locationType || 'LOCAL' as any;
    entity.isActive = command.isActive !== undefined ? command.isActive : true;
    entity.isFeatured = command.isFeatured !== undefined ? command.isFeatured : false;
    entity.status = command.status || OpportunityStatusEnum.ACTIVE;
    entity.viewCount = 0;

    const saved = await this.opportunityRepository.create(entity);
    return this.toFullResponse(saved);
  }

  /**
   * Update an opportunity
   */
  async update(
    id: string,
    command: UpdateOpportunityCommand,
  ): Promise<OpportunityFullResponse> {
    const existing = await this.findOne(id);

    if (command.summary) {
      this.validateSummary(command.summary);
    }

    if (command.deadline) {
      const deadline = new Date(command.deadline);
      this.validateDeadline(deadline);
      command.deadline = deadline.toISOString() as any;
    }

    const updateData: any = { ...command };
    if (command.deadline) {
      updateData.deadline = new Date(command.deadline);
    }
    if (command.eventDate) {
      updateData.eventDate = new Date(command.eventDate);
    }

    await this.opportunityRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Get all opportunities (public view - limited data)
   */
  async findAllPublic(
    filter: OpportunityFilterDto,
  ): Promise<OpportunityListResponse> {
    const query = new CollectionQuery();
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    query.skip = (page - 1) * limit;
    query.take = limit;

    // Build where conditions
    query.where = [];

    // Always filter active opportunities
    const whereConditions: Where[] = [
      { column: 'isActive', value: filter.isActive !== undefined ? filter.isActive : true, operator: FilterOperators.EqualTo },
      { column: 'status', value: OpportunityStatusEnum.ACTIVE, operator: FilterOperators.EqualTo },
      { column: 'deadline', value: new Date().toISOString().split('T')[0], operator: FilterOperators.GreaterThanOrEqualTo },
    ];

    if (filter.category) {
      whereConditions.push({ column: 'category', value: filter.category, operator: FilterOperators.EqualTo });
    }

    if (filter.locationType) {
      whereConditions.push({ column: 'locationType', value: filter.locationType, operator: FilterOperators.EqualTo });
    }

    if (filter.isFeatured !== undefined) {
      whereConditions.push({ column: 'isFeatured', value: filter.isFeatured, operator: FilterOperators.EqualTo });
    }

    query.where.push(whereConditions);
    query.orderBy = [{ column: 'createdAt', direction: 'DESC' }];

    const response = await this.opportunityRepository.findAll(query);
    
    const publicData = response.items.map((item) => this.toPublicResponse(item));
    
    return {
      data: publicData,
      total: response.total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(response.total / limit),
    };
  }

  /**
   * Get a single opportunity (public view)
   */
  async findOnePublic(id: string): Promise<OpportunityPublicResponse> {
    const entity = await this.opportunityRepository.findOne(id);
    
    if (!entity || !entity.isActive || entity.status !== OpportunityStatusEnum.ACTIVE) {
      throw new NotFoundException('Opportunity not found');
    }

    // Increment view count
    await this.opportunityRepository.update(id, {
      viewCount: entity.viewCount + 1,
    });

    return this.toPublicResponse(entity);
  }

  /**
   * Get a single opportunity (full details - authenticated)
   */
  async findOne(id: string): Promise<OpportunityFullResponse> {
    const entity = await this.opportunityRepository.findOne(id);
    
    if (!entity) {
      throw new NotFoundException('Opportunity not found');
    }

    // Increment view count
    await this.opportunityRepository.update(id, {
      viewCount: entity.viewCount + 1,
    });

    return this.toFullResponse(entity);
  }

  /**
   * Get all opportunities (admin view - full details)
   */
  async findAll(filter: OpportunityFilterDto): Promise<DataResponseFormat<OpportunityFullResponse>> {
    const query = new CollectionQuery();
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    query.skip = (page - 1) * limit;
    query.take = limit;

    query.where = [];
    const whereConditions: Where[] = [];

    if (filter.category) {
      whereConditions.push({ column: 'category', value: filter.category, operator: FilterOperators.EqualTo });
    }

    if (filter.locationType) {
      whereConditions.push({ column: 'locationType', value: filter.locationType, operator: FilterOperators.EqualTo });
    }

    if (filter.isFeatured !== undefined) {
      whereConditions.push({ column: 'isFeatured', value: filter.isFeatured, operator: FilterOperators.EqualTo });
    }

    if (filter.isActive !== undefined) {
      whereConditions.push({ column: 'isActive', value: filter.isActive, operator: FilterOperators.EqualTo });
    }

    if (whereConditions.length > 0) {
      query.where.push(whereConditions);
    }

    query.orderBy = [{ column: 'createdAt', direction: 'DESC' }];

    const response = await this.opportunityRepository.findAll(query);
    
    const result = new DataResponseFormat<OpportunityFullResponse>();
    result.items = response.items.map((item) => this.toFullResponse(item));
    result.total = response.total;
    
    return result;
  }

  /**
   * Delete an opportunity (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    await this.findOneOrFail(id);
    await this.opportunityRepository.softDelete(id);
    return true;
  }

  /**
   * Get featured opportunities (public view)
   */
  async findFeatured(): Promise<OpportunityPublicResponse[]> {
    const query = new CollectionQuery();
    query.skip = 0;
    query.take = 10;

    query.where = [[
      { column: 'isFeatured', value: true, operator: FilterOperators.EqualTo },
      { column: 'isActive', value: true, operator: FilterOperators.EqualTo },
      { column: 'status', value: OpportunityStatusEnum.ACTIVE, operator: FilterOperators.EqualTo },
      { column: 'deadline', value: new Date().toISOString().split('T')[0], operator: FilterOperators.GreaterThanOrEqualTo },
    ]];

    query.orderBy = [{ column: 'createdAt', direction: 'DESC' }];

    const response = await this.opportunityRepository.findAll(query);
    return response.items.map((item) => this.toPublicResponse(item));
  }

  /**
   * Track view count
   */
  async trackView(id: string): Promise<void> {
    const entity = await this.findOneOrFail(id);
    await this.opportunityRepository.update(id, {
      viewCount: entity.viewCount + 1,
    });
  }

  /**
   * Helper: Find one or fail
   */
  private async findOneOrFail(id: string): Promise<OpportunityEntity> {
    const entity = await this.opportunityRepository.findOne(id);
    if (!entity) {
      throw new NotFoundException('Opportunity not found');
    }
    return entity;
  }

  /**
   * Convert entity to public response
   */
  private toPublicResponse(entity: OpportunityEntity): OpportunityPublicResponse {
    return {
      id: entity.id,
      category: entity.category,
      title: entity.title,
      organizer: entity.organizer,
      summary: entity.summary,
      deadline: entity.deadline,
      eventDate: entity.eventDate,
      location: entity.location,
      locationType: entity.locationType,
      isFeatured: entity.isFeatured,
      createdAt: entity.createdAt,
    };
  }

  /**
   * Convert entity to full response
   */
  private toFullResponse(entity: OpportunityEntity): OpportunityFullResponse {
    return {
      id: entity.id,
      category: entity.category,
      title: entity.title,
      organizer: entity.organizer,
      summary: entity.summary,
      eligibility: entity.eligibility,
      requirements: entity.requirements,
      benefits: entity.benefits,
      deadline: entity.deadline,
      eventDate: entity.eventDate,
      officialLink: entity.officialLink,
      location: entity.location,
      locationType: entity.locationType,
      isActive: entity.isActive,
      isFeatured: entity.isFeatured,
      viewCount: entity.viewCount,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}


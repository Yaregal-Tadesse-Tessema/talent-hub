/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FormRepository } from '../persistencies/form.repository';
import {
  CreateFormCommand,
  UpdateFormCommand,
  FormFilterDto,
} from './form.command';
import {
  FormResponse,
  FormListResponse,
} from './form.response';
import { FormEntity } from '../persistencies/form.entity';
import { FormStatusEnum } from '../constants';
import { CollectionQuery, Where } from 'src/libs/Common/collection-query/query';
import { FilterOperators } from 'src/libs/Common/collection-query/filter_operators';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';

@Injectable()
export class FormService {
  constructor(
    private readonly formRepository: FormRepository,
  ) {}

  async create(command: CreateFormCommand): Promise<FormResponse> {
    const formEntity = new FormEntity();
    formEntity.title = command.title;
    formEntity.description = command.description;
    formEntity.tenantId = command.tenantId;
    formEntity.isActive = command.isActive !== undefined ? command.isActive : false;
    formEntity.status = command.status || FormStatusEnum.DRAFT;
    formEntity.design = command.design;

    const savedForm = await this.formRepository.create(formEntity);
    return this.findOne(savedForm.id);
  }

  async update(command: UpdateFormCommand): Promise<FormResponse> {
    const existingForm = await this.findOne(command.id);

    const updateData: any = {};
    if (command.title !== undefined) updateData.title = command.title;
    if (command.description !== undefined) updateData.description = command.description;
    if (command.tenantId !== undefined) updateData.tenantId = command.tenantId;
    if (command.isActive !== undefined) updateData.isActive = command.isActive;
    if (command.status !== undefined) updateData.status = command.status;
    if (command.design !== undefined) updateData.design = command.design;

    await this.formRepository.update(command.id, updateData);
    return this.findOne(command.id);
  }

  async findOne(id: string): Promise<FormResponse> {
    const form = await this.formRepository.findOne(id);
    
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return this.toResponse(form);
  }
  async findAll(filter: FormFilterDto): Promise<DataResponseFormat<FormResponse>> {
    const query = new CollectionQuery();
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    query.skip = (page - 1) * limit;
    query.take = limit;

    query.where = [];
    const whereConditions: Where[] = [];

    if (filter.tenantId) {
      whereConditions.push({ column: 'tenantId', value: filter.tenantId, operator: FilterOperators.EqualTo });
    }

    if (filter.isActive !== undefined) {
      whereConditions.push({ column: 'isActive', value: filter.isActive, operator: FilterOperators.EqualTo });
    }

    if (filter.status) {
      whereConditions.push({ column: 'status', value: filter.status, operator: FilterOperators.EqualTo });
    }

    if (whereConditions.length > 0) {
      query.where.push(whereConditions);
    }

    query.orderBy = [{ column: 'createdAt', direction: 'DESC' }];

    const response = await this.formRepository.findAll(query);
    
    const result = new DataResponseFormat<FormResponse>();
    result.items = response.items.map((item) => this.toResponse(item));
    result.total = response.total;

    return result;
  }

  /**
   * Delete a form
   */
  async delete(id: string): Promise<boolean> {
    await this.findOneOrFail(id);
    await this.formRepository.softDelete(id);
    return true;
  }

  /**
   * Helper: Find one or fail
   */
  private async findOneOrFail(id: string): Promise<FormEntity> {
    const form = await this.formRepository.findOne(id);
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    return form;
  }

  /**
   * Convert entity to response
   */
  private toResponse(entity: FormEntity): FormResponse {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      tenantId: entity.tenantId,
      isActive: entity.isActive,
      status: entity.status,
      design: entity.design,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}


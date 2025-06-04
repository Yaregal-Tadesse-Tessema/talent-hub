/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { TestimonialsRepository } from '../../persistencies/testimonials.repository';
import { CreateTestimonialsCommand, UpdateTestimonialsCommand } from './testimonial.command';

@Injectable()
export class TestimonialsService {
  constructor(
    private readonly testimonialsRepository: TestimonialsRepository,
  ) {}

  async getAll(query: CollectionQuery) {
    return await this.testimonialsRepository.findAll(query);
  }
  async getById(id: string) {
    return await this.testimonialsRepository.findOne(id);
  }
  async createEmployeeTenant(command: CreateTestimonialsCommand) {
    const employeeOrganizationCommand =
      CreateTestimonialsCommand.fromCommand(command);
    return await this.testimonialsRepository.create(
      employeeOrganizationCommand,
    );
  }
  async updateLookup(command: UpdateTestimonialsCommand) {
    return await this.testimonialsRepository.update(
      command.id,
      command,
    );
  }
  async archive(id: string) {
    const lookup = await this.testimonialsRepository.findOne(id);
    if (!lookup) throw new NotFoundException('testimonial does not exist');
    const result = await this.testimonialsRepository.softDelete(id);
    return result.affected > 0 ? true : false;
  }
}

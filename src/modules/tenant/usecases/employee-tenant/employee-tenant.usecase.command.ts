/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateEmployeeTenantCommand,
  UpdateEmployeeTenantCommand,
} from './employee-tenant.command';
import { EmployeeTenantRepository } from '../../persistencies/employee-tenant.repository';
import { LookupRepository } from '../../persistencies/lookup.repository';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { EmployeeStatus } from 'src/modules/user/usecase/user.command';

@Injectable()
export class EmployeeTenantService {
  constructor(
    private readonly employeeORganizationRepository: EmployeeTenantRepository,
    private readonly lookupRepository: LookupRepository,
  ) {}

  async getAll(query: CollectionQuery) {
    return await this.employeeORganizationRepository.findAll(query);
  }
  async getById(id: string) {
    return await this.employeeORganizationRepository.findOne(id);
  }
  async createEmployeeTenant(command: CreateEmployeeTenantCommand) {
    const lookup = await this.lookupRepository.findOne(command.lookupId);
    if (lookup) throw new BadRequestException(`create lookup first`);
    const employeeOrganizationCommand: CreateEmployeeTenantCommand = {
      jobTitle: command.jobTitle,
      lookupId: lookup.id,
      startDate: command.startDate,
      tenantId: command.tenantId,
      tenantName: command.tenantId,
      currentUser: command?.currentUser,
      status: EmployeeStatus.ACTIVE,
    };
    const employeeOrganization =
      await this.employeeORganizationRepository.create(
        employeeOrganizationCommand,
      );
    return {
      lookup,
      employeeOrganization,
    };
  }
  async updateLookup(command: UpdateEmployeeTenantCommand) {
    const lookup = await this.employeeORganizationRepository.findOne(
      command.id,
    );
    if (!lookup) throw new NotFoundException('employee does not exist');
    return await this.employeeORganizationRepository.update(
      command.id,
      command,
    );
  }
  async archive(id: string) {
    const lookup = await this.employeeORganizationRepository.findOne(id);
    if (!lookup) throw new NotFoundException('employee does not exist');
    const result = await this.employeeORganizationRepository.softDelete(id);
    return result.affected > 0 ? true : false;
  }
}

/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLookupCommand, UpdateLookupCommand } from './lookup.command';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { CreateEmployeeTenantCommand } from '../employee-tenant/employee-tenant.command';
import { EmailService } from 'src/modules/notification/usecase/email.usecase.command';
import { LookupRepository } from '../../persistencies/lookup.repository';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { EmployeeTenantRepository } from '../../persistencies/employee-tenant.repository';
@Injectable()
export class LookupService {
  constructor(
    private readonly lookupRepository: LookupRepository,
    private readonly employeeORganizationRepository: EmployeeTenantRepository,
    private readonly emailService: EmailService,
  ) {}
  async getAll(query: CollectionQuery) {
    return await this.lookupRepository.findAll(query);
  }
  async getById(id: string) {
    return await this.lookupRepository.findOne(id);
  }
  async createLookupWithTenant(command: CreateLookupCommand) {
    const lookupEntity = CreateLookupCommand.fromCommand(command);
    const lookup = await this.lookupRepository.create(lookupEntity);
    const employeeOrganizationCommand: CreateEmployeeTenantCommand = {
      jobTitle: command.jobTitle,
      lookupId: lookup.id,
      startDate: command.startDate,
      status: AccountStatusEnums.ACTIVE,
      tenantId: command.tenantId,
      tenantName: command.tenantId,
      currentUser: command?.currentUser,
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
  async createLookup(command: CreateLookupCommand) {
    const lookupEntity = CreateLookupCommand.fromCommand(command);
    const lookup = await this.lookupRepository.create(lookupEntity);
    return lookup;
  }
  async updateLookup(command: UpdateLookupCommand) {
    const lookup = await this.lookupRepository.findOne({
      where: { id: command.id },
    });
    if (!lookup) throw new NotFoundException('employee does not exist');
    return await this.lookupRepository.update(command.id, command);
  }
  async archiveLookup(id: string) {
    const lookup = await this.lookupRepository.findOne({
      where: { id: id },
    });
    if (!lookup) throw new NotFoundException('employee does not exist');
    const result = await this.lookupRepository.softDelete(id);
    return result.affected > 0 ? true : false;
  }
}
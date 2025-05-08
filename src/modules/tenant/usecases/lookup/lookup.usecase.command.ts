/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantDatabaseService } from '../tenant-database.service';
import { LookupEntity } from '../../persistencies/lookup.entity';
import { CreateLookupCommand, UpdateLookupCommand } from './lookup.command';
import { EmployeeTenantEntity } from '../../persistencies/employee-tenant.entity';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { CreateEmployeeTenantCommand } from '../employee-tenant/employee-tenant.command';
@Injectable()
export class LookupService {
  constructor(private readonly tenantDatabaseService: TenantDatabaseService) {}
  async getAll() {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(LookupEntity);
    return await tenantRepository.find();
  }
  async getById(id: string) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(LookupEntity);
    return await tenantRepository.find({ where: { id: id } });
  }
  async createLookup(command: CreateLookupCommand) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(LookupEntity);
    const employeeORganizationRepository = publicConnection.getRepository(
      EmployeeTenantEntity,
    );
    const lookup = await tenantRepository.save(command);
    const employeeOrganizationCommand: CreateEmployeeTenantCommand= {
      jobTitle: command.jobTitle,
      lookupId: lookup.id,
      startDate: command.startDate,
      status: AccountStatusEnums.ACTIVE,
      tenantId: command.tenantId,
      tenantName: command.tenantId,
      currentUser: command?.currentUser,
    };
    const employeeOrganization = await employeeORganizationRepository.save(
      employeeOrganizationCommand,
    );
    return {
      lookup,
      employeeOrganization,
    };
  }
  async updateLookup(command: UpdateLookupCommand) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const lookupRepository = publicConnection.getRepository(LookupEntity);
    const lookup = await lookupRepository.findOne({
      where: { id: command.id },
    });
    if (!lookup) throw new NotFoundException('employee does not exist');
    return await lookupRepository.update(command.id, command);
  }
  async archiveLookup(id: string) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const lookupRepository = publicConnection.getRepository(LookupEntity);
    const lookup = await lookupRepository.findOne({
      where: { id: id },
    });
    if (!lookup) throw new NotFoundException('employee does not exist');
    const result = await lookupRepository.softDelete(id);
    return result.affected > 0 ? true : false;
  }
}
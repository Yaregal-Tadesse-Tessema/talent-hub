/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantDatabaseService } from '../tenant-database.service';
import { EmployeeTenantEntity } from '../../persistencies/employee-tenant.entity';
import { CreateEmployeeTenantCommand, UpdateEmployeeTenantCommand } from './employee-tenant.command';
import { AccountStatusEnums } from 'src/modules/auth/constants';

@Injectable()
export class EmployeeTenantService {
  constructor(private readonly tenantDatabaseService: TenantDatabaseService) {}

  async getAll() {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const employeeORganizationRepository = publicConnection.getRepository(
      EmployeeTenantEntity,
    );
    return await employeeORganizationRepository.find();
  }
  async getById(id: string) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const employeeORganizationRepository = publicConnection.getRepository(
        EmployeeTenantEntity,
    );
    return await employeeORganizationRepository.find({ where: { id: id } });
  }
  async createLookup(command: CreateEmployeeTenantCommand) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(
      EmployeeTenantEntity,
    );
    const employeeORganizationRepository = publicConnection.getRepository(
      EmployeeTenantEntity,
    );
    const lookup = await tenantRepository.save(command);
    const employeeOrganizationCommand: CreateEmployeeTenantCommand = {
      jobTitle: command.jobTitle,
      lookupId: lookup.id,
      startDate: command.startDate,
      tenantId: command.tenantId,
      tenantName: command.tenantId,
      currentUser: command?.currentUser,
      status: AccountStatusEnums.ACTIVE,
    };
    const employeeOrganization = await employeeORganizationRepository.save(
      employeeOrganizationCommand,
    );
    return {
      lookup,
      employeeOrganization,
    };
  }
  async updateLookup(command: UpdateEmployeeTenantCommand) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const employeeORganizationRepository = publicConnection.getRepository(
        EmployeeTenantEntity,
    );
    const lookup = await employeeORganizationRepository.findOne({
      where: { id: command.id },
    });
    if (!lookup) throw new NotFoundException('employee does not exist');
    return await employeeORganizationRepository.update(command.id, command);
  }
  async archive(id: string) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const employeeORganizationRepository = publicConnection.getRepository(
        EmployeeTenantEntity,
    );
    const lookup = await employeeORganizationRepository.findOne({
      where: { id: id },
    });
    if (!lookup) throw new NotFoundException('employee does not exist');
    const result = await employeeORganizationRepository.softDelete(id);
    return result.affected > 0 ? true : false;
  }
}
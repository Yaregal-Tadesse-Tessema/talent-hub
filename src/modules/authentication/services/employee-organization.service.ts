/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeOrganizationEntity } from '../persistances/employee-organization.entity';
import { TenantDatabaseService } from '../tenant-database.service';
import {
  CreateEmployeeOrganizationCommand,
  UpdateEmployeeOrganizationCommand,
} from '../dtos/employee-organization';
import { UserStatusEnums } from '../constants';
@Injectable()
export class EmployeeOrganizationService {
  constructor(private readonly tenantDatabaseService: TenantDatabaseService) {}

  async getAll() {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const employeeORganizationRepository = publicConnection.getRepository(
      EmployeeOrganizationEntity,
    );
    return await employeeORganizationRepository.find();
  }
  async getById(id: string) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const employeeORganizationRepository = publicConnection.getRepository(
      EmployeeOrganizationEntity,
    );
    return await employeeORganizationRepository.find({ where: { id: id } });
  }
  async createLookup(command: CreateEmployeeOrganizationCommand) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(
      EmployeeOrganizationEntity,
    );
    const employeeORganizationRepository = publicConnection.getRepository(
      EmployeeOrganizationEntity,
    );
    const lookup = await tenantRepository.save(command);
    const employeeOrganizationCommand: CreateEmployeeOrganizationCommand = {
      jobTitle: command.jobTitle,
      lookupId: lookup.id,
      startDate: command.startDate,
      tenantId: command.tenantId,
      tenantName: command.tenantId,
      currentUser: command?.currentUser,
      status: UserStatusEnums.ACTIVE,
    };
    const employeeOrganization = await employeeORganizationRepository.save(
      employeeOrganizationCommand,
    );
    return {
      lookup,
      employeeOrganization,
    };
  }
  async updateLookup(command: UpdateEmployeeOrganizationCommand) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const employeeORganizationRepository = publicConnection.getRepository(
      EmployeeOrganizationEntity,
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
      EmployeeOrganizationEntity,
    );
    const lookup = await employeeORganizationRepository.findOne({
      where: { id: id },
    });
    if (!lookup) throw new NotFoundException('employee does not exist');
    const result = await employeeORganizationRepository.softDelete(id);
    return result.affected > 0 ? true : false;
  }
}

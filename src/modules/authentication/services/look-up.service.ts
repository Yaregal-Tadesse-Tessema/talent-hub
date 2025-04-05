/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { LookupEntity } from '../persistances/lookup.entity';
import { TenantDatabaseService } from '../tenant-database.service';
import { CreateLookupCommand, UpdateLookupCommand } from '../dtos/lookup.dto';
import { CreateEmployeeOrganizationCommand } from '../dtos/employee-organization';
import { UserStatusEnums } from '../constants';
import { EmployeeOrganizationEntity } from '../persistances/employee-organization.entity';
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
      EmployeeOrganizationEntity,
    );
    const lookup = await tenantRepository.save(command);
    const employeeOrganizationCommand: CreateEmployeeOrganizationCommand = {
      jobTitle: command.jobTitle,
      lookupId: lookup.id,
      startDate: command.startDate,
      status: UserStatusEnums.ACTIVE,
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

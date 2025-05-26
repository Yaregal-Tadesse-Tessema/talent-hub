/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLookupCommand, UpdateLookupCommand } from './lookup.command';
import { CreateEmployeeTenantCommand } from '../employee-tenant/employee-tenant.command';
import { LookupRepository } from '../../persistencies/lookup.repository';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { EmployeeTenantRepository } from '../../persistencies/employee-tenant.repository';
import { EmployeeStatus } from 'src/modules/user/usecase/user.command';
import { FileService } from 'src/modules/file/services/file.service';
import { LookupResponse } from './lookup.response';
@Injectable()
export class LookupService {
  constructor(
    private readonly lookupRepository: LookupRepository,
    private readonly employeeORganizationRepository: EmployeeTenantRepository,
    private readonly fileService: FileService,
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
      status: EmployeeStatus.ACTIVE,
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
    const lookup = await this.lookupRepository.findOne(command.id);
    if (!lookup) throw new NotFoundException('employee does not exist');
    return await this.lookupRepository.update(command.id, command);
  }
  async archiveLookup(id: string) {
    const lookup = await this.lookupRepository.findOne(id);
    if (!lookup) throw new NotFoundException('employee does not exist');
    const result = await this.lookupRepository.softDelete(id);
    return result.affected > 0 ? true : false;
  }
  async uploadProfile(file: Express.Multer.File, id: string) {
    const lookup = await this.lookupRepository.findOne(id);
    if (!lookup)
      throw new BadRequestException(`Employer with id ${id} doesn't exist`);
    if (lookup.profileImage) {
      await this.fileService.deleteBucketFile(lookup.profileImage.filename);
    }
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const fileName = file.originalname;
    const fileId = `${id}/Profile/${randomNumber}_${fileName}`;
    // const comman = { userId, fileCategory: 'Resume', metaData: { fileName } };
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    lookup.profileImage = res;
    const response = await this.lookupRepository.create(lookup);
    return LookupResponse.toResponse(response);
  }
}
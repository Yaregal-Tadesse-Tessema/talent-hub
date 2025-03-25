/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { EmployeeOrganizationEntity } from '../persistances/employee-organization.entity';
import { REQUEST } from '@nestjs/core';
@Injectable()
export class EmployeeOrganizationService extends CommonCrudService<EmployeeOrganizationEntity> {
  constructor(
    @InjectRepository(EmployeeOrganizationEntity)
    private readonly employeeOrganizationRepository: Repository<EmployeeOrganizationEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(employeeOrganizationRepository, request);
  }
}

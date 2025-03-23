import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@libs/common/repositories/base.repository';
import { REQUEST } from '@nestjs/core';
import { EmployeeOrganizationEntity } from './employee-organizations.entity';

@Injectable()
export class EmployeeOrganizationRepository extends BaseRepository<EmployeeOrganizationEntity> {
  constructor(
    @InjectRepository(EmployeeOrganizationEntity)
    repository: Repository<EmployeeOrganizationEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

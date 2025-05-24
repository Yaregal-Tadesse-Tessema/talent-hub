/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from 'src/libs/Common/common-services/base.repository';
import { EmployeeTenantEntity } from './employee-tenant.entity';
@Injectable()
export class EmployeeTenantRepository extends BaseRepository<EmployeeTenantEntity> {
  constructor(
    @InjectRepository(EmployeeTenantEntity)
    repository: Repository<EmployeeTenantEntity>,
    @Inject(REQUEST) request?: Request,
  ) {
    super(repository, request);
  }
}

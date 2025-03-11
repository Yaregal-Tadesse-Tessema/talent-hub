/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { OrganizationEntity } from '../persistencies/organization.entity';
@Injectable()
export class OrganizationService extends CommonCrudService<OrganizationEntity> {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
  ) {
    super(organizationRepository);
  }
}

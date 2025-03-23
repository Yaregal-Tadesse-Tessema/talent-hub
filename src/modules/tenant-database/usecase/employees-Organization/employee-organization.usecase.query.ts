import { CollectionQuery } from '@libs/collection-query/collection-query';
import { DataResponseFormat } from '@libs/response-format/data-response-format';
import {Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantDatabaseService } from '../tenant-database.service';
import * as dotenv from 'dotenv';
import { QueryConstructor } from '@libs/collection-query/query-constructor';
import { EmployeeOrganizationEntity } from 'modules/tenant-database/persistance/employee-organizations.entity';
import { EmployeeOrganizationsResponse } from './organization-employees.response';
dotenv.config({ path: '.env' });

@Injectable()
export class EmployeeOrganizationQuery {
  constructor(
    private tenantDatabaseService:TenantDatabaseService
  ) {}
  async getEmployeeOrganization(
    id: string,
    relations = [],
    withDeleted = false,
  ): Promise<EmployeeOrganizationsResponse> {
    const connection: DataSource = await this.tenantDatabaseService.getPublicConnection()
    const employeeOrganizationRepository=connection.getRepository(EmployeeOrganizationEntity)
    const employeeOrganization = await employeeOrganizationRepository.findOne({
      where: { id: id },
      relations,
      withDeleted,
    });
    if (!employeeOrganization) {
      throw new NotFoundException('Employee Organization not found');
    }
    return EmployeeOrganizationsResponse.toResponse(employeeOrganization);
  }
  async getEmployeeOrganizations(query: CollectionQuery) // query: CollectionQuery,
  : Promise<DataResponseFormat<any>> {
    console.log(process.env.PUBLIC_DATABASE_SCHEMA)
    const connection: DataSource = await this.tenantDatabaseService.getPublicConnection()
    const employeeOrganizationRepository=connection.getRepository(EmployeeOrganizationEntity)
    query.includes=['lookup','organization']
    const dataQuery = QueryConstructor.constructQuery(employeeOrganizationRepository,query)

    const d = new DataResponseFormat<any>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
     
      const data = result.map((item)=>{
          const lookup=item.lookup
          const tenant=item.organization
         const lookupData={
          ...lookup,tenantId:tenant.id,eoId:item.id,tenant
         }
         return lookupData
      });
      d.data=data
      d.count = total;
    }
    return d;
  }
}

import { CollectionQuery } from '@libs/collection-query/collection-query';
import { DataResponseFormat } from '@libs/response-format/data-response-format';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LookUpResponse } from './look-up.response';
import { InjectRepository } from '@nestjs/typeorm';
import { LookUpEntity } from 'modules/tenant-database/persistance/look-up-table.entity';
import { Repository } from 'typeorm';
import { QueryConstructor } from '@libs/collection-query/query-constructor';
import { TenantDatabaseService } from '../tenant-database.service';
import { EmployeeOrganizationEntity } from 'modules/tenant-database/persistance/employee-organizations.entity';
@Injectable()
export class LookUpQuery {
  constructor(
    @InjectRepository(LookUpEntity)
    private readonly lookUpRepository: Repository<LookUpEntity>,
    private readonly tenantDatabaseService: TenantDatabaseService,
  ) {}

  async getLookUp(id: string, relations = []): Promise<LookUpResponse> {
    const publicConnection=this.tenantDatabaseService.getPublicConnection()
    const lookUpRepository=(await publicConnection).getRepository(LookUpEntity)
    const lookUp = await lookUpRepository.findOne({
      where: { id: id },
      relations: relations,
    });
    if (!lookUp) {
      throw new NotFoundException('Look Up not found');
    }
    return LookUpResponse.toResponse(lookUp);
  }

  async getLookUps(
    query: CollectionQuery,
  ): Promise<DataResponseFormat<LookUpResponse>> {
    const publicConnection=this.tenantDatabaseService.getPublicConnection()
    const lookUpRepository=(await publicConnection).getRepository(LookUpEntity)
    const dataQuery = QueryConstructor.constructQuery<LookUpEntity>(
      lookUpRepository,
      query,
    );

    const d = new DataResponseFormat<LookUpResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((item) => LookUpResponse.toResponse(item));
      d.count = total;
    }
    return d;
  }
  async getOneLoopUpBy(lookupId:string,tenantId:number){
    const publicConnection=await this.tenantDatabaseService.getPublicConnection()
    const employeeOrganizationRepository = publicConnection.getRepository(EmployeeOrganizationEntity)
    const employeeOrganization=await employeeOrganizationRepository.findOne({where:{lookupId:lookupId,tenantId:tenantId},relations:{organization:true,lookup:true}})
    const loup=employeeOrganization.lookup
    const tenant=employeeOrganization.organization
    const response ={...loup,tenantId:tenantId,tenant:tenant}
    return response

  }
}

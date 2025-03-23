import { Inject, Injectable } from "@nestjs/common";
import { TenantDatabaseService } from "./tenant-database.service";
import { REQUEST } from "@nestjs/core";
import { TenantEntity } from "../persistance/tenat.entity";
import { DataSource } from "typeorm";

@Injectable()
export class TenantServiceProviderCommand {
  constructor(
    @Inject(REQUEST) private request: Request,
    private tenantDatabaseService:TenantDatabaseService
    
  ) {}
  async getTenantSpecificConnection():Promise<DataSource>{
    const tenantId=await this.request['TENANT_ID']
    const publicConnection=await this.tenantDatabaseService.getPublicConnection()
    const tenantRepository=publicConnection.getRepository(TenantEntity)
    const tenant=await tenantRepository.findOne({where:{id:tenantId}})
    const connection=await this.tenantDatabaseService.getConnection(tenant.schemaName)
    return connection
  }
  async getPublicConnection():Promise<DataSource>{
    return await this.tenantDatabaseService.getPublicConnection()
  }
}
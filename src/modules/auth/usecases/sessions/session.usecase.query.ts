import { CollectionQuery } from '@libs/collection-query/collection-query';
import { DataResponseFormat } from '@libs/response-format/data-response-format';
import { Injectable } from '@nestjs/common';
import { SessionResponse } from './session.response';
import { TenantDatabaseService } from 'modules/tenant-database/usecase/tenant-database.service';
import { SessionEntity } from '@auth/persistences/sessions/session.entity';
import { DataSource } from 'typeorm';
@Injectable()
export class SessionQuery {
  constructor(
    // private sessionRepository: SessionRepository,
    private tenantDatabaseService:TenantDatabaseService
  ) {}
  async getSession(id: string): Promise<SessionResponse> {
    const publicConnection:DataSource=await this.tenantDatabaseService.getPublicConnection()
    const sessionRepository=  publicConnection.getRepository(SessionEntity)
    const session:SessionEntity= await sessionRepository.findOneOrFail({where:{id:id}})
    // const session = await this.sessionRepository.getById(id, [], withDeleted);
    if (!session) {
      return null;
    }
    return SessionResponse.toResponse(session);
  }
  async getSessionByRefreshToken(
    refreshToken: string,
  ): Promise<SessionResponse> {
    const publicConnection:DataSource=await this.tenantDatabaseService.getPublicConnection()
    const sessionRepository=  publicConnection.getRepository(SessionEntity)
    const session = await sessionRepository.findOne(
      {where:{
        refreshToken: refreshToken,
      }},
    );
    if (!session) {
      return null;
    }
    return SessionResponse.toResponse(session);
  }
  async getSessions(
  ): Promise<DataResponseFormat<SessionResponse>> {
    const publicConnection=this.tenantDatabaseService.getPublicConnection()
    const sessionRepository=(await publicConnection).getRepository(SessionEntity)
    const employee = await sessionRepository.find();
    const data = employee.map((item) => SessionResponse.toResponse(item));
    const d: DataResponseFormat<SessionResponse> = {
      count: employee.length,
      data: data,
    };
    return d;
  }
}

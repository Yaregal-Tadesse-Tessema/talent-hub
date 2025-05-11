/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { SessionResponse } from './session.response';
import { DataSource } from 'typeorm';
import { TenantDatabaseService } from 'src/modules/tenant/usecases/tenant-database.service';
import { SessionEntity } from '../../persistences/sessions/session.entity';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
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
      total: employee.length,
      items: data,
    };
    return d;
  }
}

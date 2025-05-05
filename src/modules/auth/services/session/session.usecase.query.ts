/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { SessionResponse } from './session.response';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from '../../persistances/session.entity';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
@Injectable()
export class SessionQuery {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {}
  async getSession(id: string): Promise<SessionResponse> {
    // const publicConnection:DataSource=await this.tenantDatabaseService.getPublicConnection()
    // const sessionRepository=  publicConnection.getRepository(SessionEntity)
    const session:SessionEntity= await this.sessionRepository.findOne({where:{id:id}})
    // const session = await this.sessionRepository.getById(id, [], withDeleted);
    if (!session) {
      return null;
    }
    return SessionResponse.toResponse(session);
  }
  async getSessionByRefreshToken(
    refreshToken: string,
  ): Promise<SessionResponse> {
    // const publicConnection:DataSource=await this.tenantDatabaseService.getPublicConnection()
    // const sessionRepository=  publicConnection.getRepository(SessionEntity)
    const session = await this.sessionRepository.findOne(
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
    // const publicConnection=this.tenantDatabaseService.getPublicConnection()
    // const sessionRepository=(await publicConnection).getRepository(SessionEntity)
    const employee = await this.sessionRepository.find();
    const data = employee.map((item) => SessionResponse.toResponse(item));
    const d: DataResponseFormat<SessionResponse> = {
      total: employee.length,
      items: data,
    };
    return d;
  }
}

/* eslint-disable prettier/prettier */
import { SessionResponse } from './session.response';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SessionEntity } from '../../persistances/session.entity';
import { CreateSessionCommand } from './session.command';
@Injectable()
export class SessionCommand {
  constructor(
     @InjectRepository(SessionEntity)
        private readonly sessionRepository: Repository<SessionEntity>,
  ) {}
  @OnEvent('create-session')
  async createSession(
    command: CreateSessionCommand,
  ): Promise<SessionResponse> {
    // const sessionRepository = connection.getRepository(SessionEntity);
    const sessionDomain = CreateSessionCommand.fromCommand(command);
    const session = await this.sessionRepository.save(sessionDomain);
    return SessionResponse.toResponse(session);
  }
  async deleteSessionByToken(token: string): Promise<void> {
    const sessionDomain = await this.sessionRepository.findOne({where:{token:token}});
    if (sessionDomain) {
      await this.sessionRepository.delete(sessionDomain.id);
    }
  }
  async deleteSessionByRefreshToken(refreshToken: string): Promise<void> {
    const sessionDomain = await this.sessionRepository.findOne({where:{refreshToken:refreshToken}});
    if (sessionDomain) {
      await this.sessionRepository.delete(sessionDomain.id);
    }
  }
}

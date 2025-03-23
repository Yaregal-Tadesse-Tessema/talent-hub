import { SessionRepository } from '@auth/persistences/sessions/session.repository';
import { SessionResponse } from './session.response';
import { CreateSessionCommand } from './session.commands';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TenantDatabaseService } from 'modules/tenant-database/usecase/tenant-database.service';
import { SessionEntity } from '@auth/persistences/sessions/session.entity';
import { DataSource } from 'typeorm';
import { Util } from '@libs/common/util';

@Injectable()
export class SessionCommand {
  constructor(
    private sessionRepository: SessionRepository,
    private tenantDatabaseService: TenantDatabaseService,
  ) {}
  @OnEvent('create-session')
  async createSession(
    command: CreateSessionCommand,
    connection?: DataSource,
  ): Promise<SessionResponse> {
    const sessionRepository = connection.getRepository(SessionEntity);
    const sessionDomain = CreateSessionCommand.fromCommand(command);
    sessionDomain.id = Util.generateStripeId('Session');
    const session = await sessionRepository.save(sessionDomain);
    return SessionResponse.toResponse(session);
  }
  async deleteSessionByToken(token: string): Promise<void> {
    const sessionDomain = await this.sessionRepository.getOneBy(
      'token',
      token,
      [],
      true,
    );
    if (sessionDomain) {
      await this.sessionRepository.delete(sessionDomain.id);
    }
  }
  async deleteSessionByRefreshToken(refreshToken: string): Promise<void> {
    const sessionDomain = await this.sessionRepository.getOneBy(
      'refreshToken',
      refreshToken,
      [],
      true,
    );
    if (sessionDomain) {
      await this.sessionRepository.delete(sessionDomain.id);
    }
  }
}

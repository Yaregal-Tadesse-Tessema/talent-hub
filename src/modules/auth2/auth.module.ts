/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './persistences/sessions/session.entity';
import { AuthService } from './auth.service';

import { SessionQuery } from './usecases/sessions/session.usecase.query';
import { AuthController } from './controllers/auth.controller';
import { ResetPasswordTokenEntity } from './persistences/reset-password/reset-password.entity';
import { PassportModule } from '@nestjs/passport';
import { EmployeeEntity } from '../account/persistances/employee.entity';
import { LookupEntity } from '../tenant/persistencies/lookup.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SessionCommand } from '../auth/services/session/session.usecase.command';
import { TenantModule } from '../tenant/tenant.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResetPasswordTokenEntity,
      SessionEntity,
      EmployeeEntity,
      LookupEntity,
    ]),
    PassportModule,
    TenantModule,
  ],
  controllers: [AuthController],
  providers: [
    // ResetPasswordTokenRepository,
    JwtStrategy,
    AuthService,
    // SessionRepository,
    SessionCommand,
    SessionQuery,
    // EmployeeRepository,
  ],
})
export class AuthModule {}

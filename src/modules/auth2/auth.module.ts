import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './persistences/sessions/session.entity';
import { ResetPasswordTokenRepository } from './persistences/reset-password/reset-password.repository';
import { AuthService } from './auth.service';
import { SessionRepository } from './persistences/sessions/session.repository';
import { SessionCommand } from './usecases/sessions/session.usecase.command';
import { SessionQuery } from './usecases/sessions/session.usecase.query';
import { AuthController } from './controllers/auth.controller';
import { ResetPasswordTokenEntity } from './persistences/reset-password/reset-password.entity';
import { PassportModule } from '@nestjs/passport';
import { EmployeeEntity } from '@employee/persistences/employees/employee.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TenantDatabaseModule } from 'modules/tenant-database/tenant-database.module';
import { EmployeeRepository } from '@employee/persistences/employees/employee.repository';
import { LookUpEntity } from 'modules/tenant-database/persistance/look-up-table.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResetPasswordTokenEntity,
      SessionEntity,
      EmployeeEntity,
      LookUpEntity,
    ]),
    PassportModule,
    TenantDatabaseModule,
  ],
  controllers: [AuthController],
  providers: [
    ResetPasswordTokenRepository,
    JwtStrategy,
    AuthService,
    SessionRepository,
    SessionCommand,
    SessionQuery,
    EmployeeRepository,
  ],
})
export class AuthModule {}

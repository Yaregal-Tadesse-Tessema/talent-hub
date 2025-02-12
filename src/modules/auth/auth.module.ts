/* eslint-disable prettier/prettier */
import { forwardRef, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEntity } from '../account/persistances/employee.entity';
import { AccountEntity } from '../account/persistances/account.entity';
import { SessionEntity } from './persistances/session.entity';
import { PassportModule } from '@nestjs/passport';
import { AccountModule } from '../account/account.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { RefreshTokenStrategy } from './refreshToken.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './controllers/auth.controller';
@Global()
@Module({
    imports: [
      TypeOrmModule.forFeature([EmployeeEntity, AccountEntity, SessionEntity]),
      PassportModule,
      forwardRef(() => AccountModule),
      JwtModule.register({
        global: true,
        secret: 'sjj458a7r4w5AESJKLQHJADKWJMBN',
        signOptions: { expiresIn: '1d' },
      }),
    ],
    providers: [AuthService, RefreshTokenStrategy, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
  })
export class AuthModule {}

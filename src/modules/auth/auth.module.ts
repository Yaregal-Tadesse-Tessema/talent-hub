/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './persistances/session.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { RefreshTokenStrategy } from './refreshToken.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './controllers/auth.controller';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/usecase/user.usecase.service';
import { UserEntity } from '../user/persistence/users.entity';
import { AuthenticationModule } from '../authentication/authentication.module';
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity, UserEntity]),
    PassportModule,
    UserModule,
    AuthenticationModule,
    JwtModule.register({
      global: true,
      secret: 'sjj458a7r4w5AESJKLQHJADKWJMBN',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, RefreshTokenStrategy, JwtStrategy, UserService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

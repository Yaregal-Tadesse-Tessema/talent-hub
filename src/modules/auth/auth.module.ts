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
import { UserModule } from '../user/user.module';
import { UserService } from '../user/usecase/user.usecase.service';
import { UserEntity } from '../user/persistence/users.entity';
import { PdfService } from 'src/libs/pdf/pdf.service';
import { ApplicationEntity } from '../application/persistences/application.entity';
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeEntity,
      AccountEntity,
      SessionEntity,
      UserEntity,
      ApplicationEntity,
    ]),
    PassportModule,
    UserModule,
    forwardRef(() => AccountModule),
    JwtModule.register({
      global: true,
      secret: 'sjj458a7r4w5AESJKLQHJADKWJMBN',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    AuthService,
    RefreshTokenStrategy,
    JwtStrategy,
    UserService,
    PdfService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

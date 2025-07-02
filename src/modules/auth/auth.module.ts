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
import { PdfService } from 'src/libs/pdf/pdf.service';
import { ApplicationEntity } from '../application/persistences/application.entity';
import { SessionCommand } from './services/session/session.usecase.command';
import { SessionQuery } from './services/session/session.usecase.query';
import * as dotenv from 'dotenv';
import { ApplicationModule } from '../application/application.module';
import { LookupEntity } from '../tenant/persistencies/lookup.entity';
import { TenantEntity } from '../tenant/persistencies/tenant.entity';
import { EmployeeTenantEntity } from '../tenant/persistencies/employee-tenant.entity';
import { JobPostingEntity } from '../job-posting/job/persistencies/job-posting.entity';
import { SaveJobEntity } from '../job-posting/job/persistencies/save-job-post.entity';
import { PreScreeningQuestionEntity } from '../job-posting/job/persistencies/pre-screening-question.entity';
import { NotificationEntity } from '../notification/persistencies/notification.entity';
import { GoogleStrategy } from './google.strategy';
import { GoogleAuthController } from './controllers/google.controller';
import { GoogleAuthService } from './services/google.service';
import { TenantModule } from '../tenant/tenant.module';
dotenv.config({ path: '.env' });
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SessionEntity,
      TenantEntity,
      LookupEntity,
      EmployeeTenantEntity,
      UserEntity,
      JobPostingEntity,
      ApplicationEntity,
      SaveJobEntity,
      PreScreeningQuestionEntity,
      NotificationEntity,
      // ResetPasswordTokenEntity,
    ]),
    PassportModule,
    UserModule,
    ApplicationModule,
    TenantModule,
    JwtModule.register({
      global: true,
      secret:
        '669e081f0821d394b54b7dbad62a6e429df0fee54f905e9d1c7de1dab373a57cd4e4c871245b58ceb2a788451c9b95a3ffbbb803fb0818e566041fe10482b281',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    AuthService,
    RefreshTokenStrategy,
    JwtStrategy,
    UserService,
    PdfService,
    SessionCommand,
    SessionQuery,
    GoogleStrategy,
    GoogleAuthService,
  ],
  controllers: [AuthController, GoogleAuthController],
  exports: [AuthService],
})
export class AuthModule {}

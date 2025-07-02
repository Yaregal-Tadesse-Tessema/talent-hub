/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { JobPostingModule } from './modules/job-posting/job-posting.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './modules/user/user.module';
import { FileModule } from './modules/file/file.module';
import { ApplicationModule } from './modules/application/application.module';
import { NotificationModule } from './modules/notification/notification.module';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { ConfigModule } from '@nestjs/config';
import * as process from 'node:process';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SchemaAddInterceptor } from './libs/Common/interceptor/schema-setup';
import { TenantModule } from './modules/tenant/tenant.module';
import { TenantEntity } from './modules/tenant/persistencies/tenant.entity';
import { LookupEntity } from './modules/tenant/persistencies/lookup.entity';
import { EmployeeTenantEntity } from './modules/tenant/persistencies/employee-tenant.entity';
import { UserEntity } from './modules/user/persistence/users.entity';
import { SessionEntity } from './modules/auth/persistances/session.entity';
import { JobPostingEntity } from './modules/job-posting/job/persistencies/job-posting.entity';
import { ApplicationEntity } from './modules/application/persistences/application.entity';
import { SaveJobEntity } from './modules/job-posting/job/persistencies/save-job-post.entity';
import { PreScreeningQuestionEntity } from './modules/job-posting/job/persistencies/pre-screening-question.entity';
import { AdminUserEntity } from './modules/tenant/persistencies/admin.entity';
import { UserTenantEntity } from './modules/tenant/persistencies/user-tenant.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UserFavoriteJobEntity } from './modules/job-posting/job/persistencies/user-favorite-job.entity';
import { NotificationEntity } from './modules/notification/persistencies/notification.entity';
import { MessageEntity } from './modules/notification/persistencies/message.entity';
import { InvitationEntity } from './modules/application/persistences/invitation.entity';
import { GoogleStrategy } from './modules/auth/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { GeminiModule } from './modules/gemini/gemini.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PUBLIC_DATABASE_HOST,
      port: +process.env.PUBLIC_DATABASE_PORT,
      username: process.env.PUBLIC_DATABASE_USERNAME,
      password: process.env.PUBLIC_DATABASE_PASSWORD,
      database: process.env.PUBLIC_DATABASE_Name,
      entities: [
        SessionEntity,
        TenantEntity,
        LookupEntity,
        EmployeeTenantEntity,
        UserEntity,
        JobPostingEntity,
        ApplicationEntity,
        SaveJobEntity,
        PreScreeningQuestionEntity,
        AdminUserEntity,
        UserTenantEntity,
        UserFavoriteJobEntity,
        NotificationEntity,
        MessageEntity,
        InvitationEntity,
      ],
      synchronize: true,
    }),
    EventEmitterModule.forRoot(),
    JwtModule.register({
      secret: process.env.TOKEN_SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
    PassportModule,
    AuthModule,
    JobPostingModule,
    UserModule,
    FileModule,
    ApplicationModule,
    // TelegramModule,
    NotificationModule,
    TenantModule,
    GeminiModule,
  ],
  controllers: [],
  providers: [
    GoogleStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: SchemaAddInterceptor,
    },
  ],
})
export class AppModule {}

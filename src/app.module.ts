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
import { TelegramModule } from './modules/telegram/telegram.module';
import { NotificationModule } from './modules/notification/notification.module';
import { TenantEntity } from './modules/authentication/persistances/tenant.entity';
import { LookupEntity } from './modules/authentication/persistances/lookup.entity';
import { SessionEntity } from './modules/auth/persistances/session.entity';
import { EmployeeOrganizationEntity } from './modules/authentication/persistances/employee-organization.entity';
import { UserEntity } from './modules/user/persistence/users.entity';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SchemaAddInterceptor } from './libs/Common/interceptors/Schema-setup';
import { TenantDatabaseService } from './modules/authentication/tenant-database.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PUBLIC_DATABASE_HOST,
      port: +process.env.PUBLIC_DATABASE_PORT,
      username: process.env.PUBLIC_DATABASE_USERNAME,
      password: process.env.PUBLIC_DATABASE_PASSWORD,
      database: process.env.PUBLIC_DATABASE_Name,
      entities: [
        TenantEntity,
        LookupEntity,
        SessionEntity,
        EmployeeOrganizationEntity,
        UserEntity,
      ],
      synchronize: true,
      schema: 'public',
    }),
    EventEmitterModule.forRoot(),
    JwtModule.register({
      secret: process.env.TOKEN_SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
    // AccountModule,
    AuthModule,
    JobPostingModule,
    UserModule,
    FileModule,
    ApplicationModule,
    TelegramModule,
    NotificationModule,
    AuthenticationModule,
  ],
  controllers: [],
  providers: [
    TenantDatabaseService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SchemaAddInterceptor,
    },
  ],
  exports: [TenantDatabaseService],
})
export class AppModule {}

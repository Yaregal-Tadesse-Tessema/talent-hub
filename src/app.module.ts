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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '196.188.249.24',
      port: 5432,
      username: 'postgres',
      password: 'timewize@2024',
      database: 'talent_hub',
      entities: [
        TenantEntity,
        LookupEntity,
        SessionEntity,
        EmployeeOrganizationEntity,
        UserEntity,
        // AdminUserEntity,
      ],
      synchronize: true,
      schema: 'public',
    }),
    EventEmitterModule.forRoot(),
    JwtModule.register({
      secret: 'sjj458a7r4w5AESJKLQHJADKWJMBN',
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
  providers: [],
})
export class AppModule {}

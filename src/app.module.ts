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
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { ConfigModule } from '@nestjs/config';
import * as process from 'node:process';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PUBLIC_DATABASE_HOST,
      port: +process.env.PUBLIC_DATABASE_PORT,
      username: process.env.PUBLIC_DATABASE_USERNAME,
      password: process.env.PUBLIC_DATABASE_PASSWORD,
      database: process.env.PUBLIC_DATABASE_Name,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize:
        process.env.PUBLIC_DATABASE_SYNCHRONIZATION == 'true' ? true : false,
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { JobPostingModule } from './modules/job-posting/job-posting.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '196.188.249.24',
      port: 5432,
      username: 'postgres',
      password: 'timewize@2024',
      database: 'talent_hub',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

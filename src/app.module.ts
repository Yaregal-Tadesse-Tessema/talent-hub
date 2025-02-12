/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';

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

    JwtModule.register({
      secret: 'sjj458a7r4w5AESJKLQHJADKWJMBN',
      signOptions: { expiresIn: '1h' },
    }),
    // AccountModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
  ],
})
export class AppModule {}

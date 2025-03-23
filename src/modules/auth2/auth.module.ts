// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { SessionEntity } from './persistences/sessions/session.entity';
// import { ResetPasswordTokenRepository } from './persistences/reset-password/reset-password.repository';
// import { AuthService } from './auth.service';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([
//       ResetPasswordTokenEntity,
//       SessionEntity,
//       LookUpEntity,
//     ]),
//     PassportModule,
//     TenantDatabaseModule,
//   ],
//   controllers: [AuthController],
//   providers: [
//     ResetPasswordTokenRepository,
//     JwtStrategy,
//     AuthService,
//     SessionRepository,
//     SessionCommand,
//     SessionQuery,
//     EmployeeRepository,
//   ],
// })
// export class AuthModule {}

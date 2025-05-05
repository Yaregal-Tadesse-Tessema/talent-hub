/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Headers,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { AllowAnonymous } from '../allow-anonymous.decorator';
import * as jwt from 'jsonwebtoken';
import { Util } from 'src/libs/Common/util';
import { SessionQuery } from '../services/session/session.usecase.query';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import * as process from 'node:process';
@Controller('auth')
@ApiTags('Auth')
@AllowAnonymous()
export class AuthController {
  constructor(
    private authService: AuthService,
    private sessionQuery: SessionQuery,
  ) {}
  @Post('login')
  async login(@Body() body: LoginDto): Promise<any> {
    return await this.authService.login(body);
  }
  @Post('employee-login')
  async employeeLogin(@Body() body: LoginDto): Promise<any> {
    return await this.authService.employeeLogin(body);
  }
  @Post('refresh')
  async getRefreshToken(@Headers() headers: object) {
    console.log(process.env.TOKEN_SECRET_KEY);

    if (!headers['x-refresh-token']) {
      throw new ForbiddenException(`Refresh token required`);
    }
    try {
      const refreshToken = headers['x-refresh-token'];
      const session =
        await this.sessionQuery.getSessionByRefreshToken(refreshToken);
      if (!session) {
        throw new UnauthorizedException(
          `Token might be expired. Please login again`,
        );
      }
      const p = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET_KEY,
      ) as any;
      return {
        accessToken: Util.GenerateToken(
          {
            id: p.id,
            email: p.email,
            firstName: p.firstName,
            middleName: p.middleName,
            lastName: p.lastName,
            gender: p.gender,
            workEmail: p.workEmail,
            profileImage: p.profileImage,
            address: p.address,
            roles: p.roles,
            type: p.type,
            departmentName: p?.departmentName,
            departmentId: p?.departmentId,
            organizationName: p?.organizationName,
            organizationSchemaName: p?.organizationSchemaName,
            organizationId: p?.organizationId,
            phoneNumber: p?.phoneNumber,
          },
          '60m',
        ),
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}

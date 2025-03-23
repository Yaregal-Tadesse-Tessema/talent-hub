/* eslint-disable prettier/prettier */
import * as jwt from 'jsonwebtoken';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { SessionCommand } from '../usecases/sessions/session.usecase.command';
import { SessionQuery } from '../usecases/sessions/session.usecase.query';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { JwtAuthGuard } from 'src/modules/auth/jwt.auth.guard';
import { userInfo } from 'src/modules/auth/local-auth.guard';
import { Body, Controller, ForbiddenException, Get, Headers, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SwitchOrganizationCommand, UserLoginCommand } from '../auth.commands';
import { Util } from 'src/libs/Common/util';
import { ForgotPasswordCommand, ResetPasswordCommand, UpdatePasswordCommand } from 'src/modules/auth/auth.commands';

@ApiTags('auth')
@Controller('auth')
@AllowAnonymous()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionCommand: SessionCommand,
    private readonly sessionQuery: SessionQuery,
  ) {}
  @Post('login')
  async login(@Body() loginCommand: UserLoginCommand) {
    return await this.authService.loginMiddleWare(loginCommand);
  }
  @Post('back-office-login')
  async backOfficeLogin(@Body() loginCommand: UserLoginCommand) {
    return await this.authService.backOfficeLogin(loginCommand);
  }
  @Get('get-user-info/:tenantId')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Param('tenantId')tenantId:number,@userInfo() user: any) {
    return await this.authService.getUserInfo(user,tenantId);
  }

  @Post('refresh')
  async getRefreshToken(@Headers() headers: object) {
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
        process.env.REFRESH_SECRET_TOKEN,
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
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
  
  @Post('update-password')
  async updatePassword(@Body() command: UpdatePasswordCommand) {
    return await this.authService.updatePassword(command);
  }
  @Post('forgot-password')
  async forgetPassword(@Body() command: ForgotPasswordCommand) {
    return await this.authService.forgotPassword(command);
  }
  @Post('reset-password')
  async resetPassword(@Body() command: ResetPasswordCommand) {
    return await this.authService.resetPassword(command);
  }
  @Post('logout')
  async logout(@Headers() headers: object) {
    const authorization: string = headers['authorization'];
    const token = authorization.split(' ')[1];
    await this.sessionCommand.deleteSessionByToken(token);
    return true;
  }
  @Post('regenerate-token')
  async regenerateToken(@Headers() headers: object,@Body()command:SwitchOrganizationCommand) {
    const authorization: string = headers['authorization'];
    const token = jwt.decode(authorization.split(' ')[1]);;
   return  await this.authService.regenerateToken(token,command);
  }
}

/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto, LogoutDto } from '../dto/login.dto';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('employee-login')
  async employeeLogin(@Body() body: LoginDto): Promise<any> {
    return this.authService.employeeLogin(body);
  }
  @Post('login')
  async login(@Body() body: LoginDto): Promise<any> {
    return await this.authService.login(body);
  }
  
  @Post('logout')
  async logout(@Body() command: LogoutDto): Promise<any> {
    const result = await this.authService.employeeLogout(command);
    return result;
  }
  @Get('user')
  async getUser(@Req() req): Promise<any> {
    return req.user;
    // return this.authService.generateToken(req.user)
  }
  // @Post('refresh-token')
  // async refreshToken(@Body() { refresh_token }: RefreshTokenDto): Promise<any> {
  //   return this.authService.generateRefreshToken(refresh_token);
  // }
}

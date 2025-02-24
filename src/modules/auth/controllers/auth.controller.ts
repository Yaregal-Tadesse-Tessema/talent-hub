/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto): Promise<any> {
    return await this.authService.login(body);
  }
  @Post('employee-login')
  async employeeLogin(@Body() body: LoginDto): Promise<any> {
    return await this.authService.employeeLogin(body);
  }
}

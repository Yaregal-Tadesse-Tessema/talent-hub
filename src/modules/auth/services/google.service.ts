/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantService } from 'src/modules/tenant/usecases/tenant/tenant.usecase.command';
import { UserService } from 'src/modules/user/usecase/user.usecase.service';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
  ) {}

  // Here you can add DB logic to create or retrieve user
  async googleLogin(user: any) {
    if (!user) {
      return 'No user from Google';
    }
    // Optionally: check if user exists in your DB and create if not
    // const dbUser = await this.usersService.findOrCreate(user);
    const payload = { email: user.email, sub: user.email };

    const token = await this.jwtService.sign(payload);
    return {
      message: 'User info from Google',
      user,
      accessToken: token,
    };
  }
}

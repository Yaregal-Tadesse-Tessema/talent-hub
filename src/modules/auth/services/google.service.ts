/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleAuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Here you can add DB logic to create or retrieve user
  async googleLogin(user: any) {
    if (!user) {
      return 'No user from Google';
    }
    // Optionally: check if user exists in your DB and create if not
    // const dbUser = await this.usersService.findOrCreate(user);
    const payload = { email: user.email, sub: user.email };
    const token =await  this.jwtService.sign(payload);
    return {
      message: 'User info from Google',
      user,
      accessToken: token,
    };
  }
}

/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { FileDto } from 'src/modules/file/dtos/command/fileUploadDto';
import { TenantService } from 'src/modules/tenant/usecases/tenant/tenant.usecase.command';
import { CreateUserCommand } from 'src/modules/user/usecase/user.command';
import { UserService } from 'src/modules/user/usecase/user.usecase.service';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async googUserSignUp(user: any, res: Response) {
    if (!user) {
      return 'No user from Google';
    }
    const payload = { email: user.email, sub: user.email };
    const command = new CreateUserCommand();
    command.email = payload.email;
    command.firstName = user.firstName;
    command.lastName = user.lastName;
    command.profile = {
      path: user.picture,
    };
    command.isFirstTime = true;
    // command.password = 'C0mplex';
    const result = await this.userService.create(command, res);
    // redirect to login page
   res.redirect('http://157.230.227.83:3000/login?status=alreadyExists');
    // const token = await this.jwtService.sign(payload);
    // return {
    //   message: 'User info from Google',
    //   user,
    //   accessToken: token,
    // };
  }
  async googleLogin(user: any) {
    if (!user) {
      return 'No user from Google';
    }
    const payload = { email: user.email, sub: user.email };
    // const command: CreateUserCommand = {
    //   email: payload.email,

    // };
    const token = await this.jwtService.sign(payload);
    return {
      message: 'User info from Google',
      user,
      accessToken: token,
    };
  }
}

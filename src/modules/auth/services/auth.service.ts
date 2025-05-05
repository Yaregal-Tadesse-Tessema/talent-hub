/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { AccountQueryService } from 'src/modules/account/service/account-query.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from '../persistances/session.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/usecase/user.usecase.service';
import { SessionCommand } from './session/session.usecase.command';
import * as process from 'node:process';
@Injectable()
export class AuthService {
  constructor(
    private accountQueryService: AccountQueryService,
    private userService: UserService,
    private jwtService: JwtService,
    private readonly sessionCommand: SessionCommand,
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
  ) {}
  async generateTokenForEmployee(account: any) {
    console.log('vvvvvvv', process.env.TOKEN_SECRET_KEY);
    console.log('vvvvvvv', process.env.REFRESH_TOKEN_SECRET_KEY);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          name: account?.userName,
          email: account?.email,
          organizationId: account?.organizationId,
          phone: account?.phone,
          status: account?.status,
          skills: account?.skills,
          id: account?.id,
          sub: account?.id,
        },
        {
          secret: process.env.TOKEN_SECRET_KEY,
          expiresIn: '1h',
        },
      ),
      this.jwtService.signAsync(
        {
          name: account?.userName,
          email: account?.email,
          organizationId: account?.organizationId,
          phone: account?.phone,
          status: account?.status,
          skills: account?.skills,
          id: account?.id,
          sub: account?.id,
        },
        {
          secret: process.env.REFRESH_TOKEN_SECRET_KEY,
          expiresIn: '7d',
        },
      ),
    ]);
    await this.sessionRepository.save({
      accountId: account.id,
      accessToken,
      refreshToken,
    });
    return {
      accessToken,
      refreshToken,
      organization: account,
    };
  }
  async login({ username, password }: LoginDto) {
    const user = await this.accountQueryService.getAccountByEmail(username);
    if (!user)
      throw new UnauthorizedException(`invalid user name : ${username}`);
    if (password !== user.password)
      throw new UnauthorizedException(`Incorrect Password`);
    const token = await this.generateTokenForEmployee(user);
    await this.sessionCommand.createSession({
      accountId: user.id,
      token: token.accessToken,
      refreshToken: token.refreshToken,
    });
    return token;
  }

  async employeeLogin({ username, password }: LoginDto) {
    const employee = await this.userService.getOneByCriteria([
      { email: username },
      { phone: username },
    ]);
    if (!employee)
      throw new UnauthorizedException(` username ${username} does not exist`);
    if (password !== employee.password)
      throw new UnauthorizedException(`Incorrect Password`);
    const token = await this.generateTokenForEmployee(employee);
    await this.sessionCommand.createSession({
      accountId: employee.id,
      token: token.accessToken,
      refreshToken: token.refreshToken,
    });
    return token;
  }
}

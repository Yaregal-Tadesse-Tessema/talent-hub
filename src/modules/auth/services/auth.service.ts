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
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
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
          secret:
            '669e081f0821d394b54b7dbad62a6e429df0fee54f905e9d1c7de1dab373a57cd4e4c871245b58ceb2a788451c9b95a3ffbbb803fb0818e566041fe10482b281',
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
          secret:
            '06788ed74c52baf6ecff2876caa01619f03ca1b11b872ad1f182728d3694f227c22b35dc775ac634cd88e1c17fa80fface0cf30127b34dc8cfed063a240db46c',
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

/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from '../persistances/session.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/usecase/user.usecase.service';
import { TenantDatabaseService } from 'src/modules/authentication/tenant-database.service';
import { LookupEntity } from 'src/modules/authentication/persistances/lookup.entity';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private tenantDatabaseService: TenantDatabaseService,

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
          secret: process.env.TOKEN_SECRET,
          expiresIn: '1h',
        },
      ),
      this.jwtService.signAsync(
        {
          accountId: account?.id,
          sub: account?.id,
        },
        {
          secret: process.env.TOKEN_SECRET,
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
      profile: account,
    };
  }
  async login(command: LoginDto) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const lookupRepository = publicConnection.getRepository(LookupEntity);
    const lookup = await lookupRepository.findOne({
      where: [{ phoneNumber: command.username }, { email: command.username }],
      relations: { employeeOrganization: true },
    });
    if (!lookup)
      throw new UnauthorizedException(
        `invalid user name : ${command.username}`,
      );
    if (command.code) {
      return await this.generateTokenForEmployee(lookup);
    }

    if (command.password !== lookup.password)
      throw new UnauthorizedException(`Incorrect Password`);
    if (lookup?.employeeOrganization?.length > 1) {
      return lookup.employeeOrganization;
    } else {
      return await this.generateTokenForEmployee(lookup);
    }
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
    return await this.generateTokenForEmployee(employee);
  }
}

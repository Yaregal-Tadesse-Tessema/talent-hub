/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { AccountStatusEnums, AccountTypeEnums } from '../constants';
import { AccountQueryService } from 'src/modules/account/service/account-query.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from '../persistances/session.entity';
import { JwtService } from '@nestjs/jwt';
import { AccountEntity } from 'src/modules/account/persistances/account.entity';
@Injectable()
export class AuthService {
  constructor(
    // private userService: UserQueryService,
    private accountQueryService: AccountQueryService,
    private jwtService: JwtService,

    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
  ) {}

  // async validateEmployeeCredential(email: string,password:string) {
  //   const account = await this.accountQueryService.getAccountByEmail(email);
  //   if (!account)
  //     throw new UnauthorizedException(`Account doesn't exist!`);
  //   if (account.status !== AccountStatusEnums.ACTIVE)
  //     throw new NotFoundException(`user account not activated`);
  // }

  // async generateTokenForUser(user: any) {
  //   const account = await this.accountQueryService.getAccountById(
  //     user.accountId,
  //   );
  //   if (user.type == 'user') {
  //     const [accessToken, refreshToken] = await Promise.all([
  //       this.jwtService.signAsync(
  //         {
  //           name: user?.userName,
  //           firstName: user?.firstName,
  //           middleName: user?.middleName,
  //           lastName: user?.lastName,
  //           accountType: user?.type,
  //           sub: user?.userId,
  //           createdAt: user?.createdAt,
  //           accountId: user?.accountId,
  //           userId: user?.id,
  //           userName: user?.account?.email,
  //           role: user?.role,
  //           sex: user?.gender,
  //           profileComplete: user?.profileComplete,
  //           categoryId: account?.categoryId,
  //           accountUserType: account?.accountUserType,
  //           profilePicture: user?.profilePicture,
  //           account: {
  //             email: account?.email,
  //             organizationName: account?.organizationName,
  //             phone: account?.phone,
  //           },
  //         },
  //         {
  //           secret: process.env.TOKEN_SECRET,
  //           expiresIn: '15m',
  //         },
  //       ),
  //       this.jwtService.signAsync(
  //         {
  //           name: user?.userName,
  //           firstName: user?.firstName,
  //           middleName: user?.middleName,
  //           accountType: user?.type,
  //           sub: user?.userId,
  //           accountId: user?.accountId,
  //           userId: user.id,
  //           userName: user?.account?.email,
  //         },
  //         {
  //           secret: process.env.TOKEN_SECRET,
  //           expiresIn: '6h',
  //         },
  //       ),
  //     ]);
  //     await this.sessionRepository.save({
  //       accountId: user.accountId,
  //       accessToken,
  //       refreshToken,
  //     });
  //     return {
  //       accessToken,
  //       refreshToken,
  //     };
  //   } else {
  //     throw new BadRequestException('Invalid Request!');
  //   }
  // }
  async generateTokenForEmployee(account: AccountEntity) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          name: account?.userName,
          email: account?.email,
          organizationId: account?.organizationId,
          phone: account?.phone,
          status: account?.status,
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
      organization: account.organization,
    };
  }
  async login({ username, password }: LoginDto) {
    const user = await this.accountQueryService.getAccountByEmail(username);
    if (!user) throw new UnauthorizedException(`invalid user name${username}`);
    if (password !== user.password)
      throw new UnauthorizedException(`Incorrect Password`);
    return await this.generateTokenForEmployee(user);
  }
}

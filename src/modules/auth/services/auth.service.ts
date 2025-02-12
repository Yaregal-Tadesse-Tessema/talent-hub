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
@Injectable()
export class AuthService {
  constructor(
    // private userService: UserQueryService,
    private accountQueryService: AccountQueryService,
    private jwtService: JwtService,

    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
  ) {}
  

 
  async validateEmployeeCredential(email: string,password:string) {
    const account = await this.accountQueryService.getAccountByEmail(email);
    if (!account || account.accountType !== AccountTypeEnums.EMPLOYEE)
      throw new UnauthorizedException('Incorrect Account!');
    if (account.status !== AccountStatusEnums.ACTIVE)
      throw new NotFoundException(`user account not activated`);
  }

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
  async generateTokenForEmployee(employee: any) {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          {
            name: employee?.userName,
            firstName: employee?.firstName,
            middleName: employee?.middleName,
            lastName: employee.lastName,
            accountType: employee?.type,
            accountId: employee?.accountId,
            employeeId: employee?.id,
            sub: employee?.id,
            userName: employee?.account?.email,
            // permissions: employee?.permissions,
            roles: employee?.roles,
            sex: employee.gender,
            cityId: employee?.cityId,
            woredaId: employee?.woredaId,
            subCityId: employee?.subCityId,
            categoryId: employee?.account?.categoryId,
          },
          {
            secret: process.env.TOKEN_SECRET,
            expiresIn: '1h',
          },
        ),
        this.jwtService.signAsync(
          {
            firstName: employee?.firstName,
            middleName: employee?.middleName,
            accountType: employee?.type,
            accountId: employee?.accountId,
            employeeId: employee?.id,
            sub: employee?.id,
          },
          {
            secret: process.env.TOKEN_SECRET,
            expiresIn: '7d',
          },
        ),
      ]);
      await this.sessionRepository.save({
        accountId: employee.id,
        accessToken,
        refreshToken,
      });
      return {
        accessToken,
        refreshToken,
      };
    
  }
  async login({ username, password }: LoginDto) {
    const user = await this.accountQueryService.getAccountByEmail(username);
    if(!user)throw new UnauthorizedException(`invalid user name${username}`)
      if(password!==user.password)
    throw new UnauthorizedException(`Incorrect Password`)
      return await this.generateTokenForEmployee(user);
  }

  // async employeeLogin({ username, password }: LoginDto) {
  //   const employee = await this.validateEmployeeCredential(username,password);
  //   // if (!employee) throw new UnauthorizedException('invalid_credential');
  //   return this.generateTokenForEmployee(employee);
  // }
  // async employeeLogout(command: LogoutDto) {
  //   const decodedToken = this.jwtService.verify(command.token, {
  //     ignoreExpiration: true,
  //     secret: process.env.TOKEN_SECRET,
  //   });
  //   const oldToken = await this.sessionRepository.findOne({
  //     where: { accountId: decodedToken.accountId, accessToken: command.token },
  //   });
  //   if (oldToken) {
  //     await this.sessionRepository.delete({
  //       refreshToken: oldToken.refreshToken,
  //     });
  //   }
  //   // if (!decodedToken || isExpired) {
  //   //   throw new UnauthorizedException('Invalid refresh token');
  //   // }
  //   // const employee = await this.employeeQueryService.getEmployeeByAccountId(
  //   //   decodedToken.accountId,
  //   // );
  //   // if (!employee) throw new NotFoundException();
  //   // const result = await this.employeeCommandService.updateEmployeeStatus(
  //   //   employee.id,
  //   //   EmployeeStatusEnum.INACTIVE,
  //   // );
  //   // if (!result) {
  //   //   throw new BadRequestException('employee status update failed');
  //   // }
  //   return {};
  // }

}

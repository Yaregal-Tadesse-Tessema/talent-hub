/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { In, Repository } from 'typeorm';
import { SessionEntity } from '../persistances/session.entity';
import { JwtService } from '@nestjs/jwt';
import { SessionCommand } from './session/session.usecase.command';
import * as dotenv from 'dotenv';
import { LookupEntity } from 'src/modules/tenant/persistencies/lookup.entity';
import { activeEmployeesStatus } from '../constants';
import { Util } from 'src/libs/Common/util';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { UserInfo } from 'src/libs/Common/user-information';
import { UserResponse } from 'src/modules/user/usecase/user.response';
import { AccountEntity } from 'src/modules/account/persistances/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LookupResponse } from 'src/modules/tenant/usecases/lookup/lookup.response';
import { UserLoginCommand } from '../auth.command';
dotenv.config({ path: '.env' });
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private readonly sessionCommand: SessionCommand,
    @InjectRepository(LookupEntity)
    private readonly lookupRepository: Repository<LookupEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
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
          // schemaName=account?.employeeTenant.tenant.
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
    const user = await this.accountRepository.findOne({
      where: { email: username },
    });
    if (!user)
      throw new UnauthorizedException(`invalid user name : ${username}`);
    if (password !== user.password)
      throw new UnauthorizedException(`Incorrect Password`);
    const token = await this.generateTokenForEmployee(user);
    await this.sessionRepository.save({
      accountId: user.id,
      token: token.accessToken,
      refreshToken: token.refreshToken,
    });
    return token;
  }

  async employeeLogin({ username, password }: LoginDto) {
    const employee = await this.userRepository.findOne({
      where: [{ email: username }, { phone: username }],
    });
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

  async backOfficeLogin(loginCommand: UserLoginCommand) {
    if (
      !loginCommand.phoneNumber &&
      !loginCommand.email &&
      !loginCommand.userName
    ) {
      throw new BadRequestException('Provide your credentials to login');
    }
    if (loginCommand.orgCode) {
      const lookupData = await this.lookupRepository.findOne({
        where: {
          phoneNumber: loginCommand.phoneNumber,
          employeeTenant: {
            status: In(activeEmployeesStatus),
            tenant: {
              schemaName: loginCommand.orgCode,
              status: In(activeEmployeesStatus),
            },
          },
        },
        relations: { employeeTenant: { tenant: true } },
      });
      if (!lookupData)
        throw new BadRequestException(
          "user Doesn't exist contact administrator",
        );
      if (
        !Util.comparePassword(loginCommand.password.trim(), lookupData.password)
      ) {
        throw new BadRequestException(`Incorrect credentials`);
      }
      const tenant = lookupData.employeeTenant[0].tenant;
      const user = await this.userRepository.findOne({
        where: {
          phone: loginCommand.phoneNumber,
        },
        // relations: { department: true, employeeRoles: { role: true } },
      });
      if (!user) throw new BadRequestException('user does not exist');
      // if (loginCommand.appId == 'backOffice') {
      //   if (!account.hasBackOfficeAccess)
      //     throw new BadRequestException(
      //       'you do not have access contact the admin',
      //     );
      // }
      // const employeeRoleResponse: EmployeeRoleResponse[] =
      //   account?.employeeRoles?.length > 0
      //     ? account.employeeRoles.map((item) =>
      //         EmployeeRoleResponse.toResponse(item),
      //       )
      //     : null;
      const payload: UserInfo = {
        lookupId: lookupData.id,
        tenantId: lookupData.employeeTenant[0].tenantId,
        id: user.id,
        email: user?.email,
        firstName: user?.firstName,
        middleName: user?.middleName,
        lastName: user?.lastName,

        profileImage: user?.profile,
        // address: user?.address,
        phoneNumber: user?.phone,
        roles: [],
        tenantSchemaName: tenant?.schemaName,
        tenantName: tenant?.name,
      };
      const accessToken = Util.GenerateToken(payload, '60m'); //60m
      const refreshToken = Util.GenerateRefreshToken(payload);
      await this.sessionCommand.createSession(
        {
          accountId: payload.id,
          token: accessToken,
          refreshToken,
        },
        // connection,
      );
      return {
        accessToken,
        refreshToken,
        profile: {
          ...UserResponse.toResponse(user),
          tenantId: tenant.id,
        },
      };
    }
    const lookup = await this.lookupRepository.findOne({
      where: [
        {
          phoneNumber: loginCommand.userName,
          employeeTenant: { status: In(activeEmployeesStatus) },
        },
        {
          email: loginCommand.userName,
          employeeTenant: { status: In(activeEmployeesStatus) },
        },
      ],
      relations: { employeeTenant: { tenant: true } },
    });
    if (!lookup)
      throw new BadRequestException("user Doesn't exist contact administrator");
    if (loginCommand.password.trim() != lookup.password) {
      throw new BadRequestException(`Incorrect credentials`);
    }
    if (lookup.employeeTenant.length > 1) return lookup.employeeTenant;

    const payload: UserInfo = {
      id: lookup.id,
      tenantId: lookup.employeeTenant[0].tenantId,
      email: lookup?.email,
      firstName: lookup?.firstName,
      middleName: lookup?.middleName,
      lastName: lookup?.lastName,
      profileImage: lookup?.profileImage,
      address: lookup?.address,
      phoneNumber: lookup?.phoneNumber,
      roles: [],

      tenantSchemaName: lookup.employeeTenant[0].tenantName,
      // tenantName: tenant?.name,
    };
    const accessToken = Util.GenerateToken(payload, '60m'); //60m
    const refreshToken = Util.GenerateRefreshToken(payload);
    await this.sessionCommand.createSession(
      {
        accountId: payload.id,
        token: accessToken,
        refreshToken,
      },
      // connection,
    );
    return {
      accessToken,
      refreshToken,
      profile: {
        ...LookupResponse.toResponse(lookup),
        tenantId: lookup.employeeTenant[0].tenantId,
      },
    };
    // if (loginCommand?.orgCode) {
    //   const lookUp=await this.getUserOrganizationByCode(loginCommand)
    //   return await this.login(loginCommand,lookUp);
    // } else {
    // if (await this.hasUserMultipleOrganization(loginCommand.phoneNumber)) {
    //   const organizations = await this.getUserOrganizations(
    //     loginCommand.phoneNumber,
    //   );
    //   return organizations.map((item) => LookUpResponse.toResponse(item));
    // } else {
    //   const lookUp = await this.getUserOrganization(
    //     loginCommand.phoneNumber,
    //   );
    //   loginCommand.orgCode = lookUp.organization.code;
    //   return await this.login(loginCommand,lookUp);
    // }
    // }
  }
  async portalLogin(loginCommand: UserLoginCommand) {
    if (
      !loginCommand.phoneNumber &&
      !loginCommand.email &&
      !loginCommand.userName
    ) {
      throw new BadRequestException('Provide your credentials to login');
    }

    const lookup = await this.lookupRepository.findOne({
      where: {
        phoneNumber: loginCommand.phoneNumber,
        status: In(activeEmployeesStatus),
      },
      relations: { user: true },
    });
    if (!lookup)
      throw new BadRequestException("user Doesn't exist contact administrator");
    if (!Util.comparePassword(loginCommand.password.trim(), lookup.password)) {
      throw new BadRequestException(`Incorrect credentials`);
    }

    // if (loginCommand.appId == 'backOffice') {
    //   if (!user.hasBackOfficeAccess)
    //     throw new BadRequestException(
    //       'you do not have access contact the admin',
    //     );
    // }
    // const employeeRoleResponse: EmployeeRoleResponse[] =
    //   account?.employeeRoles?.length > 0
    //     ? account.employeeRoles.map((item) =>
    //         EmployeeRoleResponse.toResponse(item),
    //       )
    //     : null;
    const user = lookup.user;
    const payload: UserInfo = {
      lookupId: lookup.id,
      tenantId: lookup.employeeTenant[0].tenantId,
      id: user.id,
      email: user?.email,
      firstName: user?.firstName,
      middleName: user?.middleName,
      lastName: user?.lastName,
      // userName: user?.userName,
      // workEmail: user?.workEmail,
      // hasBackofficeAccess: user?.hasBackOfficeAccess,
      // type: user?.employmentType,
      profileImage: user?.profile,
      // address: user?.address,
      phoneNumber: user?.phone,
      roles: [],
      // departmentName: user?.department?.name,
      // departmentId: user?.department?.id,
      // employeeRoles: employeeRoleResponse,
      // tenantSchemaName: tenant?.schemaName,
      // tenantName: tenant?.name,
      // appId: loginCommand?.appId ? loginCommand.appId : 'backOffice',
    };
    const accessToken = Util.GenerateToken(payload, '60m'); //60m
    const refreshToken = Util.GenerateRefreshToken(payload);
    await this.sessionCommand.createSession(
      {
        accountId: payload.id,
        token: accessToken,
        refreshToken,
      },
      // connection,
    );
    return {
      accessToken,
      refreshToken,
      profile: {
        ...UserResponse.toResponse(user),
      },
    };
    // if (loginCommand?.orgCode) {
    //   const lookUp=await this.getUserOrganizationByCode(loginCommand)
    //   return await this.login(loginCommand,lookUp);
    // } else {
    // if (await this.hasUserMultipleOrganization(loginCommand.phoneNumber)) {
    //   const organizations = await this.getUserOrganizations(
    //     loginCommand.phoneNumber,
    //   );
    //   return organizations.map((item) => LookUpResponse.toResponse(item));
    // } else {
    //   const lookUp = await this.getUserOrganization(
    //     loginCommand.phoneNumber,
    //   );
    //   loginCommand.orgCode = lookUp.organization.code;
    //   return await this.login(loginCommand,lookUp);
    // }
    // }
  }
}

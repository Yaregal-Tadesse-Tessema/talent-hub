import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Util } from '@libs/common/util';
import * as crypto from 'crypto';
import { EmployeeEntity } from '@employee/persistences/employees/employee.entity';
import {
  ChangePasswordCommand,
  ForgotPasswordCommand,
  ResetPasswordCommand,
  SwitchOrganizationCommand,
  UpdatePasswordCommand,
  UserLoginCommand,
} from './auth.commands';
import { SessionCommand } from './usecases/sessions/session.usecase.command';
import { UserInfo } from '@libs/common/user-info';
import { EmployeeResponse } from '@employee/usecases/employees/employee.response';
import { ResetPasswordTokenEntity } from './persistences/reset-password/reset-password.entity';
import { EmployeeStatus } from '@libs/common/enums';
import { TenantDatabaseService } from 'modules/tenant-database/usecase/tenant-database.service';
import { LookUpEntity } from 'modules/tenant-database/persistance/look-up-table.entity';
import { EmployeeRepository } from '@employee/persistences/employees/employee.repository';
import { AdminUserResponse } from 'modules/tenant-database/usecase/admin/admin-user.response';
import { AdminUserEntity } from 'modules/tenant-database/persistance/admin-user.entity';
import { OrganizationStatusEnums } from 'modules/tenant-database/usecase/orgaization-status-enums';
import { EmployeeOrganizationEntity } from 'modules/tenant-database/persistance/employee-organizations.entity';
import { activeEmployeesStatus } from '@libs/common/constants';
import { EmployeeRoleResponse } from '@employee/usecases/employees/employee-role.response';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
    private readonly employeesRepository: EmployeeRepository,
    @InjectRepository(ResetPasswordTokenEntity)
    private readonly resetPasswordTokenRepository: Repository<ResetPasswordTokenEntity>,
    private readonly eventEmitter: EventEmitter2,
    private readonly sessionCommand: SessionCommand,
    private readonly tenantDatabaseService: TenantDatabaseService,
    @InjectRepository(LookUpEntity)
    private readonly lookUpRepository: Repository<LookUpEntity>,
  ) {}
  private activeEmployeesStatus = [
    EmployeeStatus.ACTIVE,
    EmployeeStatus.ON_LEAVE,
    EmployeeStatus.ON_PROBATION,
  ];
  async hasUserMultipleOrganization(phoneNumber: string) {
    const accountLookUp = await this.getUserOrganizations(phoneNumber);
    if (accountLookUp?.length <= 0)
      throw new BadRequestException('account not found');
    if (accountLookUp.length > 1) return true;
    return false;
  }

  async getUserOrganizations(phoneNumber: string) {
    const connection = await this.tenantDatabaseService.getPublicConnection();
    const lookUpRepository = connection.getRepository(LookUpEntity);
    const accountLookUp = await lookUpRepository.find({
      where: {
        phoneNumber: phoneNumber,
        hasBackOfficeAccess: true,
      },
      relations: { employeeOrganization: { organization: true } },
    });
    if (accountLookUp.length == 0)
      throw new BadRequestException('account does not exist');
    if (accountLookUp.length == 0)
      throw new BadRequestException('account does not exist');
    return accountLookUp;
  }
  async getUserOrganization(phoneNumber: string) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();

    const lookUpRepository = publicConnection.getRepository(LookUpEntity);
    const accountLookUp = await lookUpRepository.findOne({
      where: {
        phoneNumber: phoneNumber,
        hasBackOfficeAccess: true,
      },
      relations: { employeeOrganization: { organization: true } },
    });
    if (!accountLookUp) throw new BadRequestException('account does not exist');
    if (!accountLookUp.employeeOrganization)
      throw new BadRequestException('organization does not exist');
    return accountLookUp;
  }
  async getUserOrganizationByCode(command: UserLoginCommand) {
    const connection = await this.tenantDatabaseService.getPublicConnection();
    const lookUpRepository = connection.getRepository(LookUpEntity);
    const accountLookUp = await lookUpRepository.findOne({
      where: {
        phoneNumber: command.phoneNumber,
        employeeOrganization: {
          organization: {
            code: command.orgCode,
            status: OrganizationStatusEnums.Active,
          },
        },
        hasBackOfficeAccess: true,
      },
      relations: { employeeOrganization: { organization: true } },
    });
    if (!accountLookUp) throw new BadRequestException('account does not exist');
    if (!accountLookUp.employeeOrganization)
      throw new BadRequestException('organization does not exist');
    return accountLookUp;
  }
  async loginMiddleWare(loginCommand: UserLoginCommand) {
    const connection = await this.tenantDatabaseService.getPublicConnection();
    const lookUpRepository = connection.getRepository(LookUpEntity);
    // if (loginCommand.appId !== 'backOffice') {
    //   throw new BadRequestException(`Invalid App Id`);
    // }
    if (!loginCommand.password) {
      throw new BadRequestException('Password is required');
    }
    if (
      !loginCommand.phoneNumber &&
      !loginCommand.email &&
      !loginCommand.userName
    ) {
      throw new BadRequestException('Provide your credentials to login');
    }
    if (loginCommand.orgCode) {
      const lookUpData = await lookUpRepository.findOne({
        where: {
          phoneNumber: loginCommand.phoneNumber,
          employeeOrganization: {
            status:In(activeEmployeesStatus),
            organization: { schemaName: loginCommand.orgCode,status:In(activeEmployeesStatus) },
          },
        },
        relations: { employeeOrganization: { organization: true } },
      });
      if (!lookUpData) throw new BadRequestException("user Doesn't exist contact administrator");
      if (!Util.comparePassword(loginCommand.password.trim(), lookUpData.password)) {
        throw new BadRequestException(`Incorrect credentials`);
      }
      const organization = lookUpData.employeeOrganization[0].organization;
      const schemaName = organization.schemaName;
      const connection2 =
        await this.tenantDatabaseService.getConnection(schemaName);
      const employeeRepository = connection2.getRepository(EmployeeEntity);
      const account = await employeeRepository.findOne({
        where: {
          phoneNumber: loginCommand.phoneNumber,
        },
        relations: { department: true,employeeRoles:{role:true} },
      });
      if (!account) throw new BadRequestException('employee does not exist');
      if(loginCommand.appId=='backOffice'){
        if (!account.hasBackOfficeAccess) throw new BadRequestException('you do not have access contact the admin');
      }
      const employeeRoleResponse:EmployeeRoleResponse[]=account?.employeeRoles?.length>0?account.employeeRoles.map((item)=>EmployeeRoleResponse.toResponse(item)):null
      const payload: UserInfo = {
        lookupId: lookUpData.id,
        tenantId: lookUpData.employeeOrganization[0].tenantId,
        id: account.id,
        email: account?.email,
        firstName: account?.firstName,
        middleName: account?.middleName,
        lastName: account?.lastName,
        userName: account?.userName,
        workEmail: account?.workEmail,
        hasBackofficeAccess: account?.hasBackOfficeAccess,
        gender: account?.gender,
        type: account?.employmentType,
        profileImage: account?.profileImage,
        address: account?.address,
        phoneNumber: account?.phoneNumber,
        roles: [],
        departmentName: account?.department?.name,
        employeeRoles:employeeRoleResponse,
        departmentId: account?.department?.id,
        organizationSchemaName: organization?.schemaName,
        organizationName: organization?.name,
        organizationId: organization?.id,
        appId: loginCommand?.appId ? loginCommand.appId : 'backOffice',
      };
      const accessToken = Util.GenerateToken(payload, '60m'); //60m
      const refreshToken = Util.GenerateRefreshToken(payload);
      await this.sessionCommand.createSession(
        {
          accountId: payload.id,
          token: accessToken,
          refreshToken,
        },
        connection,
      );
      return {
        accessToken,
        refreshToken,
        profile: {
          ...EmployeeResponse.toResponse(account),
          tenantId: organization.id,
        },
      };
    }
    const lookUp = await lookUpRepository.findOne({
      where: { phoneNumber: loginCommand.phoneNumber ,employeeOrganization:{status:In(activeEmployeesStatus)}},
      relations: { employeeOrganization: { organization: true } },
    });
    if (!lookUp) throw new BadRequestException("user Doesn't exist contact administrator");
    if (!Util.comparePassword(loginCommand.password.trim(), lookUp.password)) {
      throw new BadRequestException(`Incorrect credentials`);
    }
    if (lookUp.employeeOrganization.length > 1)
      return lookUp.employeeOrganization;
    const organization = lookUp.employeeOrganization[0].organization;
    const schemaName = organization.schemaName;
    const connection2 =
      await this.tenantDatabaseService.getConnection(schemaName);
    const employeeRepository = connection2.getRepository(EmployeeEntity);
    const account = await employeeRepository.findOne({
      where: {
        phoneNumber: loginCommand.phoneNumber,
      },
      relations: { department: true,employeeRoles:{role:true} },
    });
    if(loginCommand.appId=='backOffice'){
      if (!account.hasBackOfficeAccess) throw new BadRequestException('you do not have access contact the admin');
    }
    const employeeRoleResponse:EmployeeRoleResponse[]=account?.employeeRoles?.length>0?account.employeeRoles.map((item)=>EmployeeRoleResponse.toResponse(item)):null
    const payload: UserInfo = {
      lookupId: lookUp.id,
      tenantId: lookUp.employeeOrganization[0].tenantId,
      id: account.id,
      email: account?.email,
      firstName: account?.firstName,
      middleName: account?.middleName,
      lastName: account?.lastName,
      userName: account?.userName,
      workEmail: account?.workEmail,
      hasBackofficeAccess: account?.hasBackOfficeAccess,
      gender: account?.gender,
      type: account?.employmentType,
      profileImage: account?.profileImage,
      address: account?.address,
      phoneNumber: account?.phoneNumber,
      roles: [],
      departmentName: account?.department?.name,
      departmentId: account?.department?.id,
      employeeRoles:employeeRoleResponse,
      organizationSchemaName: organization?.schemaName,
      organizationName: organization?.name,
      organizationId: organization?.id,
      appId: loginCommand?.appId ? loginCommand.appId : 'backOffice',
    };
    const accessToken = Util.GenerateToken(payload, '60m'); //60m
    const refreshToken = Util.GenerateRefreshToken(payload);
    await this.sessionCommand.createSession(
      {
        accountId: payload.id,
        token: accessToken,
        refreshToken,
      },
      connection,
    );
    return {
      accessToken,
      refreshToken,
      profile: {
        ...EmployeeResponse.toResponse(account),
        tenantId: organization.id,
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
  async loginMiddleWareCopy(loginCommand: UserLoginCommand) {
    const connection = await this.tenantDatabaseService.getPublicConnection();
    const lookUpRepository = connection.getRepository(LookUpEntity);
    // if (loginCommand.appId !== 'backOffice') {
    //   throw new BadRequestException(`Invalid App Id`);
    // }
    if (!loginCommand.password) {
      throw new BadRequestException('Password is required');
    }
    if (
      !loginCommand.phoneNumber &&
      !loginCommand.email &&
      !loginCommand.userName
    ) {
      throw new BadRequestException('Provide your credentials to login');
    }
    if (loginCommand.orgCode) {
      const lookUpData = await lookUpRepository.findOne({
        where: {
          phoneNumber: loginCommand.phoneNumber,
          employeeOrganization: {
            organization: { id: +loginCommand.orgCode },
          },
        },
        relations: { employeeOrganization: { organization: true } },
      });
      if (!lookUpData) throw new BadRequestException("user Doesn't exist");
      const organization = lookUpData.employeeOrganization[0].organization;

      const schemaName = organization.schemaName;
      const connection2 =
        await this.tenantDatabaseService.getConnection(schemaName);
      const employeeRepository = connection2.getRepository(EmployeeEntity);
      const account = await employeeRepository.findOne({
        where: {
          phoneNumber: loginCommand.phoneNumber,
        },
        relations: { department: true,employeeRoles:{role:true}},
      });
      if (!account) throw new BadRequestException('employee does not exist');
      if(loginCommand.appId=='backOffice'){
        if(!account.hasBackOfficeAccess) throw ('')
      }
      const employeeRoleResponse:EmployeeRoleResponse[]=account?.employeeRoles?.length>0?account.employeeRoles.map((item)=>EmployeeRoleResponse.toResponse(item)):null
      const payload: UserInfo = {
        lookupId: lookUpData.id,
        tenantId: lookUpData.employeeOrganization[0].tenantId,
        id: account.id,
        email: account?.email,
        firstName: account?.firstName,
        middleName: account?.middleName,
        lastName: account?.lastName,
        userName: account?.userName,
        workEmail: account?.workEmail,
        hasBackofficeAccess: account?.hasBackOfficeAccess,
        gender: account?.gender,
        type: account?.employmentType,
        profileImage: account?.profileImage,
        address: account?.address,
        phoneNumber: account?.phoneNumber,
        roles: [],
        employeeRoles:employeeRoleResponse,
        departmentName: account?.department?.name,
        departmentId: account?.department?.id,
        organizationSchemaName: organization?.schemaName,
        organizationName: organization?.name,
        organizationId: organization?.id,
        appId: loginCommand?.appId ? loginCommand.appId : 'backOffice',
      };
      const accessToken = Util.GenerateToken(payload, '60m'); //60m
      const refreshToken = Util.GenerateRefreshToken(payload);
      await this.sessionCommand.createSession(
        {
          accountId: payload.id,
          token: accessToken,
          refreshToken,
        },
        connection,
      );
      return {
        accessToken,
        refreshToken,
        profile: {
          ...EmployeeResponse.toResponse(account),
          tenantId: organization.id,
        },
      };
    }
    const lookUp = await lookUpRepository.findOne({
      where: { phoneNumber: loginCommand.phoneNumber },
      relations: { employeeOrganization: { organization: true } },
    });
    if (!lookUp) throw new BadRequestException("user Doesn't exist");
    if (loginCommand.password !== lookUp.password) {
      throw new BadRequestException(`Incorrect credentials`);
    }
    if (lookUp.employeeOrganization.length > 1)
      return lookUp.employeeOrganization;
    const organization = lookUp.employeeOrganization[0].organization;

    const schemaName = organization.schemaName;
    const connection2 =
      await this.tenantDatabaseService.getConnection(schemaName);
    const employeeRepository = connection2.getRepository(EmployeeEntity);
    const account = await employeeRepository.findOne({
      where: {
        phoneNumber: loginCommand.phoneNumber,
      },
      relations: { department: true,employeeRoles:{role:true} },
    });
    const employeeRoleResponse:EmployeeRoleResponse[]=account?.employeeRoles?.length>0?account.employeeRoles.map((item)=>EmployeeRoleResponse.toResponse(item)):null
    const payload: UserInfo = {
      lookupId: lookUp.id,
      tenantId: lookUp.employeeOrganization[0].tenantId,
      id: account.id,
      email: account?.email,
      firstName: account?.firstName,
      middleName: account?.middleName,
      lastName: account?.lastName,
      userName: account?.userName,
      workEmail: account?.workEmail,
      hasBackofficeAccess: account?.hasBackOfficeAccess,
      gender: account?.gender,
      type: account?.employmentType,
      profileImage: account?.profileImage,
      address: account?.address,
      phoneNumber: account?.phoneNumber,
      roles: [],
      employeeRoles:employeeRoleResponse,
      departmentName: account?.department?.name,
      departmentId: account?.department?.id,
      organizationSchemaName: organization?.schemaName,
      organizationName: organization?.name,
      organizationId: organization?.id,
      appId: loginCommand?.appId ? loginCommand.appId : 'backOffice',
    };
    const accessToken = Util.GenerateToken(payload, '60m'); //60m
    const refreshToken = Util.GenerateRefreshToken(payload);
    await this.sessionCommand.createSession(
      {
        accountId: payload.id,
        token: accessToken,
        refreshToken,
      },
      connection,
    );
    return {
      accessToken,
      refreshToken,
      profile: {
        ...EmployeeResponse.toResponse(account),
        tenantId: organization.id,
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
  async regenerateToken(decodedToken: any, command: SwitchOrganizationCommand) {
    const connection = await this.tenantDatabaseService.getPublicConnection();
    const lookUpRepository = connection.getRepository(LookUpEntity);
    // const decodedToken: any = jwt.decode(token);
    const schemaName = decodedToken.organizationSchemaName;
    const connection2 =
      await this.tenantDatabaseService.getConnection(schemaName);
    const employeeRepository = connection2.getRepository(EmployeeEntity);

    const lookUpData = await lookUpRepository.findOne({
      where: {
        phoneNumber: decodedToken.phoneNumber,
      },
      relations: { employeeOrganization: { organization: true } },
    });
    const loginCommand: UserLoginCommand = {
      appId: command.appId,
      orgCode: command.orgCode,
      phoneNumber: lookUpData.phoneNumber,
      password: lookUpData.password,
    };
    return await this.loginMiddleWareCopy(loginCommand);
  }
  async getUserInfo(user: UserInfo, tenantId: number) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const empOrgRepo = await publicConnection.getRepository(
      EmployeeOrganizationEntity,
    );
    const eo = await empOrgRepo.findOne({
      where: { lookupId: user.lookupId, tenantId: tenantId },
      relations: { organization: true },
    });
    const connection = await this.tenantDatabaseService.getConnection(
      eo.organization.schemaName,
    );
    const employeeRepository = await connection.getRepository(EmployeeEntity);
    const profile = await employeeRepository.findOne({
      where: {
        phoneNumber: user.phoneNumber,
      },
    });
    return { ...user, profile };
  }
  async login(loginCommand: UserLoginCommand, lookUp: LookUpEntity) {
    const connection = await this.tenantDatabaseService.getPublicConnection();
    // this is for testing to be removed
    const organization = lookUp.employeeOrganization[0].organization;
    if (!organization)
      throw new BadRequestException(`Organization doesn't exist`);
    if (!organization?.schemaName)
      throw new BadRequestException(`Organization Schema is not setup`);
    const schemaName = organization.schemaName;
    const connection2 =
      await this.tenantDatabaseService.getConnection(schemaName);
    const employeeRepository = connection2.getRepository(EmployeeEntity);
    // if (loginCommand.appId !== 'backOffice') {
    //   throw new BadRequestException(`Invalid App Id`);
    // }
    if (!loginCommand.password) {
      throw new BadRequestException('Password is required');
    }
    if (
      !loginCommand.phoneNumber &&
      !loginCommand.email &&
      !loginCommand.userName
    ) {
      throw new BadRequestException('Provide your credentials to login');
    }
    const account = await employeeRepository.findOne({
      where: {
        phoneNumber: loginCommand.phoneNumber,
      },
      relations: { department: true,employeeRoles:{role:true} },
    });
    if (!account) {
      throw new BadRequestException("account doesn't exist");
    }
    if (!Util.comparePassword(loginCommand.password, lookUp.password)) {
      throw new BadRequestException(`Incorrect credentials`);
    }
    if (account.status === EmployeeStatus.INACTIVE || !account.status) {
      throw new BadRequestException(
        `You have been blocked, please contact us.`,
      );
    }
    const employeeRoleResponse:EmployeeRoleResponse[]=account?.employeeRoles?.length>0?account.employeeRoles.map((item)=>EmployeeRoleResponse.toResponse(item)):null

    const payload: UserInfo = {
      lookupId: lookUp.id,
      tenantId: lookUp?.employeeOrganization[0]?.tenantId,
      id: account.id,
      email: account?.email,
      firstName: account?.firstName,
      middleName: account?.middleName,
      lastName: account?.lastName,
      userName: account?.userName,
      workEmail: account?.workEmail,
      hasBackofficeAccess: account?.hasBackOfficeAccess,
      gender: account?.gender,
      type: account?.employmentType,
      profileImage: account?.profileImage,
      address: account?.address,
      phoneNumber: account?.phoneNumber,
      roles: [],
      departmentName: account?.department?.name,
      employeeRoles:employeeRoleResponse,
      departmentId: account?.department?.id,
      organizationSchemaName: organization?.schemaName,
      organizationName: organization?.name,
      organizationId: organization?.id,
      appId: loginCommand?.appId ? loginCommand.appId : 'backOffice',
    };
    const accessToken = Util.GenerateToken(payload, '60m'); //60m
    const refreshToken = Util.GenerateRefreshToken(payload);
    await this.sessionCommand.createSession(
      {
        accountId: payload.id,
        token: accessToken,
        refreshToken,
      },
      connection,
    );
    return {
      accessToken,
      refreshToken,
      profile: {
        ...EmployeeResponse.toResponse(account),
        tenantId: organization.id,
      },
    };
  }
  async backOfficeLogin(loginCommand: UserLoginCommand) {
    const connection = await this.tenantDatabaseService.getPublicConnection();
    const repository = connection.getRepository(AdminUserEntity);

    // if (loginCommand.appId !== 'backOffice') {
    //   throw new BadRequestException(`Invalid App Id`);
    // }
    if (!loginCommand.password) {
      throw new BadRequestException('Password is required');
    }
    if (
      !loginCommand.phoneNumber &&
      !loginCommand.email &&
      !loginCommand.userName
    ) {
      throw new BadRequestException('Provide your credentials to login');
    }
    const account = await repository.findOne({
      where: {
        phoneNumber: loginCommand.phoneNumber,
      },
      relations:{}
    });
    if (!account) {
      throw new BadRequestException("account doesn't exist");
    }
    if (!Util.comparePassword(loginCommand.password, account.password)) {
      throw new BadRequestException(`Incorrect credentials`);
    }
    if (account.status === EmployeeStatus.INACTIVE || !account.status) {
      throw new BadRequestException(
        `You have been blocked, please contact us.`,
      );
    }

    const payload: UserInfo = {
      id: account.id,
      tenantId: null,
      lookupId: null,
      email: account?.email,
      middleName: account?.middleName,
      firstName: account.firstName,
      lastName: account?.lastName,
      userName: account?.userName,
      workEmail: account?.workEmail,
      hasBackofficeAccess: account?.hasBackOfficeAccess,
      gender: account?.gender,
      type: account?.employmentType,
      profileImage: account?.profileImage,
      address: account?.address,
      phoneNumber: account?.phoneNumber,
      roles: [],
      appId: loginCommand?.appId ? loginCommand.appId : 'backOffice',
    };
    const accessToken = Util.GenerateToken(payload, '60m'); //60m
    const refreshToken = Util.GenerateRefreshToken(payload);
    await this.sessionCommand.createSession(
      {
        accountId: payload.id,
        token: accessToken,
        refreshToken,
      },
      connection,
    );

    return {
      accessToken,
      refreshToken,
      profile: {
        ...AdminUserResponse.toResponse(account),
      },
    };
  }
 
  async updatePassword(updatePasswordCommand: UpdatePasswordCommand) {
    const user = await this.employeeRepository.findOneBy({
      phoneNumber: updatePasswordCommand.phoneNumber,
    });
    if (!user) {
      throw new NotFoundException(
        `User account not found with this phone number`,
      );
    }
    user.password = Util.hashPassword(updatePasswordCommand.password);
    const result = await this.employeeRepository.update(user.id, user);
    return result ? true : false;
  }
  async forgotPassword(command: ForgotPasswordCommand) {
    const account = await this.employeeRepository.findOneBy({
      email: command.email,
    });
    if (!account) {
      throw new BadRequestException(
        `User Account does not exist with email ${command.email}`,
      );
    }

    //delete the previous token
    await this.resetPasswordTokenRepository.delete({
      accountId: account.id,
    });
    const token = crypto.randomBytes(32).toString('hex');
    const resetPasswordTokenPayload = {
      accountId: account.id,
      email: command.email,
      token: Util.hashPassword(token),
    };
    const resetPasswordToken = await this.resetPasswordTokenRepository.save(
      resetPasswordTokenPayload,
    );

    if (!resetPasswordToken) {
      throw new BadRequestException('unknown error happen. Please try again');
    }
    const resetPasswordLink = `${process.env.WEBSITE_DOMAIN}/${process.env.RESET_PASSWORD_URL}?token=${token}&id=${account.id}`;
    const emailPayload = {
      name: `${account.firstName} ${account.middleName}`,
      email: command.email,
      url: resetPasswordLink,
    };
    this.eventEmitter.emit('reset-password', emailPayload);
    return true;
  }
  async resetPassword(command: ResetPasswordCommand) {
    const resetPassword = await this.resetPasswordTokenRepository.findOneBy({
      accountId: command.id,
    });
    if (!resetPassword) {
      throw new BadRequestException(`Invalid or expired password reset token`);
    }
    if (!Util.comparePassword(command.token, resetPassword.token)) {
      throw new BadRequestException(`Invalid or expired password reset token`);
    }
    const tokenExpiredAt = resetPassword.createdAt.getTime() + 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    const d = currentTime - tokenExpiredAt;
    if (d >= 0) {
      throw new BadRequestException(`Invalid or expired password reset token`);
    }
    const account = await this.employeeRepository.findOneBy({
      email: resetPassword.email,
    });
    if (!account) {
      throw new BadRequestException(`User Account does not exist`);
    }
    account.password = Util.hashPassword(command.password);
    const result = await this.employeeRepository.update(account.id, account);
    if (result) {
      //delete the token
      await this.resetPasswordTokenRepository.delete({
        accountId: account.id,
      });
      return true;
    }
    return false;
  }
}

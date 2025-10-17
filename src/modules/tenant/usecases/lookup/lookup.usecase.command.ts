/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { ChangePasswordCommand, CreateLookupCommand, UpdateLookupCommand } from './lookup.command';
import { CreateEmployeeTenantCommand } from '../employee-tenant/employee-tenant.command';
import { LookupRepository } from '../../persistencies/lookup.repository';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { EmployeeTenantRepository } from '../../persistencies/employee-tenant.repository';
import { EmployeeStatus } from 'src/modules/user/usecase/user.command';
import { FileService } from 'src/modules/file/services/file.service';
import { LookupResponse } from './lookup.response';
import { TenantEntity } from '../../persistencies/tenant.entity';
import { TenantResponse } from '../tenant/tenant.response';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/modules/notification/usecase/email.usecase.command';
import { Util } from 'src/libs/Common/util';
import { UserInfo } from 'src/libs/Common/user-information';
import { Response } from 'express';
import { UserStatusEnums } from 'src/modules/user/constants';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { UserType } from '../../constants';
@Injectable()
export class LookupService {
  constructor(
    private readonly lookupRepository: LookupRepository,
    private readonly employeeORganizationRepository: EmployeeTenantRepository,
    private readonly fileService: FileService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) { }
  async getAll(query: CollectionQuery) {
    return await this.lookupRepository.findAll(query);
  }
  async getById(id: string) {
    return await this.lookupRepository.findOne(id);
  }
  async createLookupWithTenant(command: CreateLookupCommand) {
    const lookupEntity = CreateLookupCommand.fromCommand(command);
    const lookup = await this.lookupRepository.create(lookupEntity);
    const employeeOrganizationCommand: CreateEmployeeTenantCommand = {
      jobTitle: command.jobTitle,
      lookupId: lookup.id,
      startDate: command.startDate,
      status: EmployeeStatus.ACTIVE,
      tenant_Id: command.tenantId,
      tenantName: command.tenantId,
      currentUser: command?.currentUser,
    };
    const employeeOrganization =
      await this.employeeORganizationRepository.create(
        employeeOrganizationCommand,
      );
    return {
      lookup,
      employeeOrganization,
    };
  }
  async createLookup(command: CreateLookupCommand) {
    if (command.email) {
      const employeerAlreadyExist =
        await this.lookupRepository.getOneByCriteria({ email: command.email });
      if (employeerAlreadyExist)
        throw new BadRequestException(
          `Employer with email${command.email} already exists`,
        );
    }
    if (command.phoneNumber) {
      const employeerAlreadyExist =
        await this.lookupRepository.getOneByCriteria({
          phoneNumber: command.phoneNumber,
        });
      if (employeerAlreadyExist)
        throw new BadRequestException(
          `Employer with phone${command.phoneNumber} already exists`,
        );
    }
    const lookupEntity = CreateLookupCommand.fromCommand(command);
    lookupEntity.userType = UserType.EMPLOYER;
    const lookup = await this.lookupRepository.create(lookupEntity);
    if (lookup?.status == UserStatusEnums.PENDING) {
      const payload: UserInfo = {
        id: lookupEntity.id,
        email: lookupEntity?.email,
        firstName: lookupEntity?.firstName,
        middleName: lookupEntity?.middleName,
        lastName: lookupEntity?.lastName,
        profileImage: lookupEntity?.profileImage,
        address: lookupEntity?.address,
        phoneNumber: lookupEntity?.phoneNumber,
        roles: [],
        userType: UserType.EMPLOYEE,
      };
      const token = Util.GenerateToken(payload);
      await this.sendActivationMessage(
        payload.email,
        `${payload.firstName} ${payload.middleName} ${payload.lastName}`,
        token,
        payload.id,
      );
    }
    return lookup;
  }
  async updateLookup(command: UpdateLookupCommand) {
    const lookup = await this.lookupRepository.findOne(command.id);
    if (!lookup) throw new NotFoundException('employee does not exist');
    command.password = lookup.password
    command.id = lookup.id
    return await this.lookupRepository.create(command);
  }
  async archiveLookup(id: string) {
    const lookup = await this.lookupRepository.findOne(id);
    if (!lookup) throw new NotFoundException('employee does not exist');
    const result = await this.lookupRepository.softDelete(id);
    return result;
  }
  async delete(id: string) {
    const lookup = await this.lookupRepository.findOne(id);
    if (!lookup) throw new NotFoundException('employee does not exist');
    const result = await this.lookupRepository.delete(id);
    return result;
  }
  async changePassword(command: ChangePasswordCommand) {
    const lookup = await this.lookupRepository.findOne(command?.currentUser?.id,['employeeTenant','employeeTenant.tenant']);
    if (!lookup) throw new NotFoundException('employee does not exist');
    if (command.password != command.confirmPassword) throw new BadRequestException('The password and confirm password does not match');
    const hashedPassword = Util.hashPassword(command.password);
    lookup.password=hashedPassword
    const result = await this.lookupRepository.update(lookup.id,{password:hashedPassword});
    return result;
  }

  async getTenantsByLookupId(lookupId: string) {
    const lookup = await this.employeeORganizationRepository.getManyByCriteria(
      {
        lookupId: lookupId,
      },
      ['tenant'],
    );
    if (!lookup) throw new NotFoundException('Lookup does not exist');
    const tenants: TenantEntity[] = [];
    for (let index = 0; index < lookup.length; index++) {
      const lookupEntity = lookup[index];
      tenants.push(lookupEntity.tenant);
    }
    return tenants.map((item) => TenantResponse.toResponse(item));
  }
  async uploadProfile(file: Express.Multer.File, id: string) {
    const lookup = await this.lookupRepository.findOne(id);
    if (!lookup)
      throw new BadRequestException(`Employer with id ${id} doesn't exist`);
    if (lookup.profileImage) {
      await this.fileService.deleteBucketFile(lookup.profileImage.filename);
    }
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const fileName = file.originalname;
    const fileId = `${id}/Profile/${randomNumber}_${fileName}`;
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    lookup.profileImage = res;
    const response = await this.lookupRepository.create(lookup);
    return LookupResponse.toResponse(response);
  }
  async activateAccount(token: string, @Res() res: Response, lookUpId: string) {
    if (!token) {
      throw new BadRequestException('Activation token is required');
    }
    const payload = await this.jwtService.verifyAsync(token);
    if (!payload) {
      const lookupEntity = await this.lookupRepository.findOne(lookUpId, [
        'employeeTenant',
      ]);
      if (!lookupEntity) throw new BadRequestException(`User Doesn't exist`);
      const payload: UserInfo = {
        id: lookupEntity.id,
        tenantId: lookupEntity.employeeTenant[0]?.tenantId,
        email: lookupEntity?.email,
        firstName: lookupEntity?.firstName,
        middleName: lookupEntity?.middleName,
        lastName: lookupEntity?.lastName,
        profileImage: lookupEntity?.profileImage,
        address: lookupEntity?.address,
        phoneNumber: lookupEntity?.phoneNumber,
        roles: [],
      };
      const token = Util.GenerateToken(payload);
      await this.sendActivationMessage(
        lookupEntity.email,
        `${lookupEntity.firstName} ${lookupEntity.middleName} ${lookupEntity.lastName}`,
        token,
        lookUpId,
      );
      return res.redirect('https://talent-hub.org/?status=activationSent'); // frontend error page indicating a new activation is sent
    }
    if (!payload?.id) throw new NotFoundException(`user Id not Found`);
    const lookup = await this.lookupRepository.findOne(payload.id);
    if (lookup.status == AccountStatusEnums.ACTIVE) {
      return res.redirect(
        'https://talent-hub.org/login?status=alreadyActivated',
      );
    }
    const success = await this.lookupRepository.update(payload.id, {
      status: UserStatusEnums.ACTIVE,
    });
    if (success) {
      return res.redirect(
        'https://talent-hub.org/login?status=successfullyActivated',
      ); // frontend success page
    } else {
      return res.redirect('https://talent-hub.org/status=failedToActivate'); // frontend error page
    }
  }
  async sendActivationMessage(
    to: string,
    fullName: string,
    token: string,
    lookUpId: string,
  ): Promise<boolean> {
    const activationLink = `https://app.talent-hub.org/api/lookups/activate-account/${lookUpId}?token=${token}`;
    const subject = 'Activate Your Account 🚀';

    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hello ${fullName},</h2>
      <p>Thank you for registering with us! To complete your registration and activate your account, please click the button below:</p>
      <a href="${activationLink}"
         style="
           display: inline-block;
           padding: 12px 24px;
           margin: 20px 0;
           font-size: 16px;
           color: white;
           background-color: #007bff;
           text-decoration: none;
           border-radius: 6px;
         "
         target="_blank">
        Activate My Account
      </a>
      <p>If the button doesn’t work, copy and paste the following link into your browser:</p>
      <p><a href="${activationLink}">${activationLink}</a></p>
      <p>This link will expire in 24 hours for your security.</p>
      <p>Welcome aboard!<br/>— The YourCompany Team</p>
    </div>
     `;
    if (!to) throw new BadRequestException(`Reciver email is Mandatory`);
    await this.emailService.sendGridEmail(to, subject, html, `${fullName}`);
    return true;
  }
}
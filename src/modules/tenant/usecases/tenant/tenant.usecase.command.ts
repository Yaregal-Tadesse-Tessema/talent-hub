/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';

import axios from 'axios';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import {
  CheckOrganizationFromETrade,
  CreateTenantCommand,
  UpdateTenantCommand,
} from './tenant.command';
import { TenantResponse } from './tenant.response';
import { CreateLookupCommand } from '../lookup/lookup.command';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { CreateEmployeeTenantCommand } from '../employee-tenant/employee-tenant.command';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { TenantRepository } from '../../persistencies/tenant.repository';
import { LookupRepository } from '../../persistencies/lookup.repository';
import { EmployeeTenantRepository } from '../../persistencies/employee-tenant.repository';
import { EmployeeStatus } from 'src/modules/user/usecase/user.command';
import { FileService } from 'src/modules/file/services/file.service';
import { EmployeeTenantEntity } from '../../persistencies/employee-tenant.entity';
import { AfroMessageService } from 'src/modules/sms/afro-message.service';
import { UserType } from '../../constants';
import { UserInfo } from 'src/libs/Common/user-information';
import { Util } from 'src/libs/Common/util';
import { UserRepository } from 'src/modules/user/persistence/user.repository';
dotenv.config({ path: '.env' });
@Injectable()
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly lookupRepository: LookupRepository,
    private readonly employeeTenantRepository: EmployeeTenantRepository,
    private readonly fileService: FileService,
    private readonly afroMessageService: AfroMessageService,
  ) { }
  private readonly axiosInstance = axios.create({
    baseURL: 'https://etrade.gov.et/api',
    timeout: 5000,
    headers: {
      Referer: 'https://etrade.gov.et/business-license-checker',
    },
  });
  async updateTenant(command: UpdateTenantCommand): Promise<TenantResponse> {
    const tenantEntity = UpdateTenantCommand.fromCommand(command);
    tenantEntity.code = tenantEntity.schemaName;
    const result = await this.tenantRepository.create(command);
    return TenantResponse.toResponse(result);
  }
  async createTenant(command: CreateTenantCommand): Promise<TenantResponse> {
    const tenantEntity = CreateTenantCommand.fromCommand(command);
    tenantEntity.id = command?.id;
    const result = await this.tenantRepository.create(tenantEntity);
    return TenantResponse.toResponse(result);
  }
  async CreateAccounts(command: CreateTenantCommand) {
    if (!command?.currentUser)
      throw new BadRequestException(
        `Create You first need to login as Employer`,
      );
    if (!command.phoneNumber && !command.email) {
      throw new BadRequestException(`Phone or email is mandatory`);
    }
    const criteria = [];
    if (command?.email || command?.email !== '' || command?.email !== undefined || command?.email !== null) {
      criteria.push({ email: command.email });
    }
    if (command?.phoneNumber || command?.phoneNumber !== '' || command?.phoneNumber !== undefined || command?.phoneNumber !== null) {
      criteria.push({ phoneNumber: command.phoneNumber });
    }
    if (command?.tin || command?.tin !== '' || command?.tin !== undefined || command?.tin !== null) {
      criteria.push({ tin: command.tin });
    }
    const alreadyExist = await this.tenantRepository.getOneByCriteria(criteria);
    command.id = alreadyExist?.id
    const tenantEntity: TenantResponse = await this.createTenant(command);
    const employeeOrganizationCommand: CreateEmployeeTenantCommand = {
      tenant_Id: tenantEntity.id,
      lookupId: command.currentUser.id,
      startDate: new Date(),
      status: EmployeeStatus.ACTIVE,
      tenantName: tenantEntity.name,
      jobTitle: 'Administrator',
    };
    await this.employeeTenantRepository.create(employeeOrganizationCommand);
    const userEntity = await this.lookupRepository.findOne(command.currentUser.id);
    userEntity.tenantId = tenantEntity.id;
    const res = await this.lookupRepository.create(userEntity);
    return tenantEntity;
  }
  async registerOrganizationWithETrade(
    command: CheckOrganizationFromETrade,
  ): Promise<any> {

    const alreadyExist = await this.tenantRepository.getOneByCriteria({
      tin: command.tin,
    });

    if (alreadyExist)
      throw new BadRequestException(
        `Organization Already exists. Please login to access your account.`,
      );
    try {
      const licenseInformation = await this.getBusinessLicenseFromEtrade(
        command.licenseNumber.trim(),
        command.tin.trim(),
      );
      if (!licenseInformation.data)
        throw new NotFoundException(
          `Organization with License Number ${command.licenseNumber} does not exist`,
        );
      const phoneNumber = licenseInformation.data?.AddressInfo.MobilePhone
      if (!phoneNumber) {
        throw new BadRequestException(`Phone number is not associated with this organization please Register Manually`);
      }
      if (!command?.otpCode) {
        await this.afroMessageService.sendOtp(phoneNumber);
        const last4Digits = phoneNumber.slice(-4);
        const message = `One time password is sent to the phone Number ending with ${last4Digits}`;
        return {
          stsus: 'Otp sent',
          message: message,
        };
      } else {
        const res = await this.afroMessageService.verifyOtp({ phoneNumber, otpCode: command.otpCode.toString() });
        if (res.acknowledge === 'error') {
          throw new BadRequestException('Invalid OTP');
        }
        const salt = process.env.BCRYPT_SALT;
        const createCommand: CreateTenantCommand = {
          name: licenseInformation.data.TradeName,
          tin: command.tin,
          isVerified: true,
          address: licenseInformation.data?.AddressInfo,
          licenseNumber: command.licenseNumber,
          registrationNumber: command.tin,
          email: licenseInformation.data.email,
          phoneNumber: licenseInformation.data.AddressInfo.MobilePhone,
          status: AccountStatusEnums.ACTIVE,
        };
        const tenantAlreadyExists = await this.tenantRepository.getOneByCriteria({
          tin: command.tin,
        });
        createCommand.id = tenantAlreadyExists?.id;
        const tenantEntity = await this.createTenant(createCommand);
        const lookUpId = command?.currentUser?.id;
        let lookupEntity = await this.lookupRepository.findOne(lookUpId);
        if (!lookUpId) {
          const lookupCommand: CreateLookupCommand = {
            email: tenantEntity?.email,
            phoneNumber: tenantEntity.phoneNumber,
            password: await bcrypt.hash('C0mplex!', salt),
            status: AccountStatusEnums.ACTIVE,
            userType: UserType.EMPLOYER,
            tenantId: tenantEntity.id,
            createdBy: command?.currentUser?.id,
            updatedBy: command?.currentUser?.id,
          };
          const lookupAlreadyExists = await this.lookupRepository.getOneByCriteria({
            phoneNumber: tenantEntity.phoneNumber,
          });
          lookupCommand.id = lookupAlreadyExists?.id;
          lookupEntity = await this.lookupRepository.create(lookupCommand);
        }
        console.log(createCommand);
        const employeeoRganizationCommand: CreateEmployeeTenantCommand = {
          tenant_Id: tenantEntity.id,
          lookupId: lookupEntity.id,
          startDate: new Date(),
          status: EmployeeStatus.ACTIVE,
          tenantName: tenantEntity.name,
          jobTitle: 'Administrator',
          createdBy: command?.currentUser?.id,
          updatedBy: command?.currentUser?.id,
        };
        const employeeTenantAlreadyExists = await this.employeeTenantRepository.getOneByCriteria({
          tenant_Id: tenantEntity.id,
          lookupId: lookUpId,
        });
        employeeoRganizationCommand.id = employeeTenantAlreadyExists?.id;
        const employeeORganizationEntity: EmployeeTenantEntity = await this.employeeTenantRepository.create(employeeoRganizationCommand);
        const payload: UserInfo = {
          id: lookupEntity.id,
          tenantId: tenantEntity.id,
          email: lookupEntity?.email,
          firstName: lookupEntity?.firstName,
          middleName: lookupEntity?.middleName,
          lastName: lookupEntity?.lastName,
          profileImage: lookupEntity?.profileImage,
          address: lookupEntity?.address,
          phoneNumber: lookupEntity?.phoneNumber,
          roles: [],
          tenantSchemaName: tenantEntity.name,
        };
        const accessToken = Util.GenerateToken(payload, '60m'); //60m
        const refreshToken = Util.GenerateRefreshToken(payload);
        const tenantEntityData = TenantResponse.toEntity(tenantEntity);
        employeeORganizationEntity.tenant = tenantEntityData;
        return {
          employeeTenant: employeeORganizationEntity,
          accessToken,
          refreshToken,
          message: `Tenant created successfully`,
        };
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Unable to verify TIN. Please try again');
    }
  }
  async verifyTenantFromETrade(
    command: CheckOrganizationFromETrade,
  ): Promise<any> {

    const alreadyExist = await this.tenantRepository.getOneByCriteria({
      tin: command.tin,
    });

    if (alreadyExist)
      throw new BadRequestException(
        `Organization Already exists. Please login to access your account.`,
      );
    try {
      const licenseInformation = await this.getBusinessLicenseFromEtrade(
        command.licenseNumber.trim(),
        command.tin.trim(),
      );
      if (!licenseInformation.data)
        throw new NotFoundException(
          `Organization with License Number ${command.licenseNumber} does not exist`,
        );
      const phoneNumber = licenseInformation.data?.AddressInfo.MobilePhone
      if (!phoneNumber) {
        throw new BadRequestException(`Phone number is not associated with this organization please Register Manually`);
      }
      if (!command?.otpCode) {
        await this.afroMessageService.sendOtp(phoneNumber);
        const last4Digits = phoneNumber.slice(-4);
        const message = `One time password is sent to the phone Number ending with  ${last4Digits}`;
        return {
          stsus: 'Otp sent',
          message: message,
        };
      } else {
        const res = await this.afroMessageService.verifyOtp({ phoneNumber, otpCode: command.otpCode.toString() });
        if (res.acknowledge === 'error') {
          throw new BadRequestException('Invalid OTP');
        }
        const salt = process.env.BCRYPT_SALT;
        const createCommand: CreateTenantCommand = {
          name: licenseInformation.data.TradeName,
          tin: command.tin,
          isVerified: true,
          address: licenseInformation.data?.AddressInfo,
          licenseNumber: command.licenseNumber,
          registrationNumber: command.tin,
          email: licenseInformation.data.email,
          phoneNumber: licenseInformation.data.AddressInfo.MobilePhone,
          status: AccountStatusEnums.ACTIVE,
        };
        createCommand.id = alreadyExist?.id;
        const tenantEntity = await this.createTenant(createCommand);
        const lookUpId = command?.currentUser?.id;
        let lookupEntity = await this.lookupRepository.findOne(lookUpId, ['employeeTenant']);
        const payload: UserInfo = {
          id: lookupEntity.id,
          tenantId: tenantEntity.id,
          email: lookupEntity?.email,
          firstName: lookupEntity?.firstName,
          middleName: lookupEntity?.middleName,
          lastName: lookupEntity?.lastName,
          profileImage: lookupEntity?.profileImage,
          address: lookupEntity?.address,
          phoneNumber: lookupEntity?.phoneNumber,
          roles: [],
          tenantSchemaName: tenantEntity.name,
        };
        const accessToken = Util.GenerateToken(payload, '60m'); //60m
        const refreshToken = Util.GenerateRefreshToken(payload);
        return {
          employeeTenant: lookupEntity?.employeeTenant,
          accessToken,
          refreshToken,
          message: `Tenant verified and updated successfully`,
        };
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Unable to verify TIN. Please try again');
    }
  }
  async getBusinessLicenseFromEtrade(
    LicenseNo: string,
    tin: string,
  ): Promise<{ status: number; data: any }> {
    try {
      const response = await this.axiosInstance.get(
        `/BusinessMain/GetBusinessByLicenseNo?LicenseNo=${LicenseNo}&Tin=${tin}&Lang=en`,
      );
      return { status: response.status, data: response.data };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Unable to verify Business License. Please try again',
      );
    }
  }
  async getTenant(id: string) {
    return await this.tenantRepository.findOne(id, ['organizationEmployees']);
  }
  async getTenantAndCandidatesCount(
    query: CollectionQuery,
  ): Promise<{ tenants: number; candidates: number }> {
    // push a query to filter only those active tenants
    if (!query.where) query.where = [];
    query.where.push([
      {
        column: 'status',
        operator: '=',
        value: 'Active',
      }
    ]);
    const result = await this.tenantRepository.findAllPublic(query);
    const candidates = await this.lookupRepository.findAllPublic(query);
    return { tenants: result.total, candidates: candidates.total };
  }
  async getTenants(query: CollectionQuery) {
    const response = await this.tenantRepository.findAllPublic(query);
    return response;
  }
  async uploadLogo(file: Express.Multer.File, id: string) {
    const tenant = await this.tenantRepository.findOne(id);
    if (!tenant)
      throw new BadRequestException(`Tenant with id ${id} doesn't exist`);
    if (tenant.logo) {
      await this.fileService.deleteBucketFile(tenant.logo.filename);
    }
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const fileName = file.originalname;
    const fileId = `${id}/logo/${randomNumber}_${fileName}`;
    // const comman = { userId, fileCategory: 'Resume', metaData: { fileName } };
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    tenant.logo = res;
    const response = await this.tenantRepository.create(tenant);
    return TenantResponse.toResponse(response);
  }
  async uploadCover(file: Express.Multer.File, id: string) {
    const tenant = await this.tenantRepository.findOne(id);
    if (!tenant)
      throw new BadRequestException(`Tenant with id ${id} doesn't exist`);
    if (tenant.cover) {
      await this.fileService.deleteBucketFile(tenant.logo.filename);
    }
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const fileName = file.originalname;
    const fileId = `${id}/cover/${randomNumber}_${fileName}`;
    // const comman = { userId, fileCategory: 'Resume', metaData: { fileName } };
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    tenant.cover = res;
    const response = await this.tenantRepository.create(tenant);
    return TenantResponse.toResponse(response);
  }
  async getTenantsByToken(decodedToken: any) {
    const employeeTenant: EmployeeTenantEntity[] =
      await this.employeeTenantRepository.getManyByCriteriaWithOutToken(
        {
          lookupId: decodedToken.id,
          status: EmployeeStatus.ACTIVE,
        },
        ['tenant'],
      );
    const tenants = employeeTenant.map((item) => item.tenant);
    return tenants.map((item) => TenantResponse.toResponse(item));
  }
  async getTenantCount(query: CollectionQuery): Promise<number> {
    const tenantCount = await this.employeeTenantRepository.getCount(query);
    return tenantCount;
  }
  async verifyETradeWorks(
    LicenseNo = process.env.LICENSE_NUMBER,
    tin = process.env.TIN,
  ): Promise<boolean> {
    try {
      await this.axiosInstance.get(
        `/BusinessMain/GetBusinessByLicenseNo?LicenseNo=${LicenseNo}&Tin=${tin}&Lang=en`,
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async getProfileCompleteness(tenantId: string): Promise<{ percentage: number }> {
    const tenant = await this.tenantRepository.findOne(tenantId);

    if (!tenant) {
      return { percentage: 0 };
    }
    // Define fields and their weights
    const fieldsWithWeights = [
      { key: 'phone', weight: 25 },
      { key: 'email', weight: 25 },
      { key: 'tradeName', weight: 20 },
      { key: 'haAiActivated', weight: 5 },
      { key: 'address', weight: 20 },
      { key: 'isVerified', weight: 20 },
      { key: 'tin', weight: 25 },
      { key: 'licenseNumber', weight: 15 },
      { key: 'registrationNumber', weight: 15 },
      { key: 'logo', weight: 20 },
      { key: 'cover', weight: 20 },
      { key: 'companySize', weight: 10 },
      { key: 'industry', weight: 25 },
      { key: 'organizationType', weight: 5 },
      { key: 'selectedCalender', weight: 5 },
      { key: 'isProfilePublic', weight: 5 },
      { key: 'links', weight: 5 },
    ];

    // Calculate total score
    let filledScore = 0;
    let totalWeight = 0;

    for (const field of fieldsWithWeights) {
      totalWeight += field.weight;
      if (
        tenant[field.key] &&
        (Array.isArray(tenant[field.key]) ? tenant[field.key].length > 0 : true)
      ) {
        filledScore += field.weight;
      }
    }
    const percentage = Math.round((filledScore / totalWeight) * 100);

    return { percentage };
  }

  async delete(id: string) {
    const tenant = await this.tenantRepository.findOne(id, ['jobPostings']);
    if (tenant.jobPostings.length > 0) throw new BadRequestException('Tenant has job postings cannot be deleted');
    if (!tenant) throw new NotFoundException('tenant does not exist');
    const result = await this.tenantRepository.delete(id);
    return result;
  }
}

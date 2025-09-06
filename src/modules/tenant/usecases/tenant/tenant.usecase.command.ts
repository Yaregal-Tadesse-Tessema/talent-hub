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
    await this.tenantRepository.update(tenantEntity.id, tenantEntity);
    return TenantResponse.toResponse(tenantEntity);
  }
  async createTenant(command: CreateTenantCommand): Promise<TenantResponse> {
    const tenantEntity = CreateTenantCommand.fromCommand(command);
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
    const alreadyExist = await this.tenantRepository.getOneByCriteria([
      {
        email: command.email,
      },
      {
        phoneNumber: command.phoneNumber,
      },
      {
        tin: command.tin,
      },
    ]);
    if (alreadyExist)
      throw new ConflictException(
        `Organization already registered with thi email and password`,
      );
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
        `Organization Already exists Please Login`,
      );
    try {
      // const response = await this.axiosInstance.get(
      //   `/Registration/GetRegistrationInfoByTin/${command.tin}/en`,
      // );
      // if (!response.data)
      //   throw new NotFoundException(
      //     `Organization with tin ${command.tin} does not exist`,
      //   );
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
          lookupId: lookUpId,
          startDate: new Date(),
          status: EmployeeStatus.ACTIVE,
          tenantName: tenantEntity.name,
          jobTitle: 'Administrator',
        };
        const employeeTenantAlreadyExists = await this.employeeTenantRepository.getOneByCriteria({
          tenant_Id: tenantEntity.id,
          lookupId: lookUpId,
        });
        employeeoRganizationCommand.id = employeeTenantAlreadyExists?.id;
        const employeeORganizationEntity =
          await this.employeeTenantRepository.create(employeeoRganizationCommand);
        return {
          tenantEntity,
          lookupEntity,
          employeeORganizationEntity,
          message: `One time password is sent to the phone Numner ${licenseInformation.data?.AddressInfo.MobilePhone
            }`,
        };
      }

    } catch (error) {
      console.log(error);
      throw new BadRequestException('Unable to verify TIN. Please try again');
    }
  }
  // async generateRegistrationNumber(orgCode = '', serviceCode?: string) {
  //   const today = new Date();
  //   // const dateFormatted = new Date(
  //   //   today.getFullYear(),
  //   //   today.getMonth(),
  //   //   today.getDate(),
  //   //   0,
  //   //   0,
  //   //   0,
  //   //   0,
  //   // );
  //   const shortDate =
  //     today.getFullYear().toString().slice(-2) +
  //     '' +
  //     ('0' + (today.getMonth() + 1)).slice(-2) +
  //     '' +
  //     ('0' + today.getDate()).slice(-2);
  //   const lastApplication = await this.tenantRepository.getLastInsertedItem()
  //   const applicationResult = lastApplication.registrationNumber;

  //   const applicationNo = orgCode.concat(
  //     '-',
  //     serviceCode,
  //     '-',
  //     shortDate,
  //     '-',
  //     (applicationResult + 1).toString(),
  //   );
  //   console.log(applicationNo);
  //   return applicationNo;
  // }
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
}

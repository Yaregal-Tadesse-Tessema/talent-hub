/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountEntity } from '../persistances/account.entity';
import {
  CheckOrganizationFromETrade,
  CreateAccountCommand,
} from '../dtos/command.dto/account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { OrganizationEntity } from 'src/modules/organization/persistencies/organization.entity';
import { CreateOrganizationCommand } from 'src/modules/organization/usecase/organization.command';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import axios from 'axios';
import { AccountQueryService } from './account-query.service';
import { TenantService } from 'src/modules/authentication/services/tenant.service';
import {
  CreateTenantCommand,
  TenantResponse,
} from 'src/modules/authentication/dtos/tenant.dto';
import {
  TenantSubscriptionType,
  UserStatusEnums,
} from 'src/modules/authentication/constants';
import { CreateLookupCommand } from 'src/modules/authentication/dtos/lookup.dto';
import { LookupEntity } from 'src/modules/authentication/persistances/lookup.entity';
import { CreateEmployeeOrganizationCommand } from 'src/modules/authentication/dtos/employee-organization';
import { EmployeeOrganizationEntity } from 'src/modules/authentication/persistances/employee-organization.entity';
@Injectable()
export class AccountCommandService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(LookupEntity)
    private readonly lookupRepository: Repository<LookupEntity>,
    @InjectRepository(EmployeeOrganizationEntity)
    private readonly employeeOrganizationRepository: Repository<EmployeeOrganizationEntity>,
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
    private readonly accountQueryService: AccountQueryService,
    private readonly tenantService: TenantService,
  ) {}
  private readonly axiosInstance = axios.create({
    baseURL: 'https://etrade.gov.et/api',
    timeout: 5000,
    headers: {
      Referer: 'https://etrade.gov.et/business-license-checker',
    },
  });
  async CreateAccounts(command: CreateOrganizationCommand) {
    if (!command.phone && !command.email) {
      throw new BadRequestException(`Phone or email is mandatory`);
    }
    const alreadyExist = await this.accountRepository.findOne({
      where: {
        email: command.email,
        phone: command.phone,
        organization: { tinNumber: command.tinNumber },
      },
    });
    if (alreadyExist)
      throw new ConflictException(`Organization already exists`);

    const tenantCommand: CreateTenantCommand = {
      name: command.companyName,
      tin: command.tinNumber,
      phoneNumber: command.phone,
      email: command.email,
      companySize: command.companySize,
      industry: command.industry,
      address: command.address,
      isActive: true,
      logo: command.companyLogo,
      subscriptionType: TenantSubscriptionType.FREE,
    };
    const tenantEntity: TenantResponse =
      await this.tenantService.createTenant(tenantCommand);
    const entity: CreateLookupCommand = {
      password: 'C0mplex@123',
      email: command.email,
      phoneNumber: command.phone,
      firstName: 'Root',
      middleName: 'Administrator',
      status: UserStatusEnums.ACTIVE,
    };
    const lookEntity = await this.lookupRepository.save(entity);
    const employeeoRganizationCommand: CreateEmployeeOrganizationCommand = {
      tenantId: tenantEntity.id,
      lookupId: lookEntity.id,
      startDate: new Date(),
      status: UserStatusEnums.ACTIVE,
      tenantName: tenantEntity.name,
      jobTitle: 'Administrator',
    };
    const employeeORganizationEntity =
      await this.employeeOrganizationRepository.save(
        employeeoRganizationCommand,
      );
    return { tenantEntity, lookEntity, employeeORganizationEntity };
  }
  async updateAccountRefreshToken(accountId: string, refreshToken: string) {
    await this.accountRepository.update(
      { id: accountId },
      { refreshToken: refreshToken },
    );
  }

  async updateRefreshToken(accountId: string, refreshToken: string) {
    try {
      return await this.accountRepository.update(
        { id: accountId },
        { refreshToken: refreshToken },
      );
    } catch (error) {
      throw error;
    }
  }
  async generateRegistrationNumber(orgCode = 'IFHCRS', serviceCode: string) {
    const today = new Date();
    const dateFormatted = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0,
    );
    const shortDate =
      today.getFullYear().toString().slice(-2) +
      '' +
      ('0' + (today.getMonth() + 1)).slice(-2) +
      '' +
      ('0' + today.getDate()).slice(-2);
    const applicationResult = await this.accountRepository.count({
      where: { createdAt: MoreThanOrEqual(dateFormatted) },
    });
    const applicationNo = orgCode.concat(
      '-',
      serviceCode,
      '-',
      shortDate,
      '-',
      (applicationResult + 1).toString(),
    );
    console.log(applicationNo);
    return applicationNo;
  }
  async registerOrganizationWithETrade(
    command: CheckOrganizationFromETrade,
  ): Promise<{
    status: string;
    data: any;
    result: any;
    account: any;
    message: any;
  }> {
    try {
      const alreadyExist = await this.organizationRepository.findOne({
        where: { tinNumber: command.tin },
      });

      if (alreadyExist)
        throw new BadRequestException(
          `Organization Already exists Please Login`,
        );
      const response = await this.axiosInstance.get(
        `/Registration/GetRegistrationInfoByTin/${command.tin}/en`,
      );
      if (!response.data)
        throw new NotFoundException(
          `Organization with tin ${command.tin} does not exist`,
        );
      const licenseInformation =
        await this.accountQueryService.getBusinessLicenseFromEtrade(
          command.licenseNumber,
          command.tin,
        );
      if (!licenseInformation.data)
        throw new NotFoundException(
          `Organization with License Number ${command.licenseNumber} does not exist`,
        );
      const registrationNumber = await this.generateRegistrationNumber(
        'Emp',
        'ORG',
      );
      const createCommand: CreateOrganizationCommand = {
        companyName: licenseInformation.data.TradeName,
        description: '',
        tinNumber: command.tin,
        verified: true,
        address: licenseInformation.data?.AddressInfo,
        licenseNumber: command.licenseNumber,
        organizationNumber: registrationNumber,
      };

      const result = await this.organizationRepository.save(createCommand);
      const accountEntity: CreateAccountCommand = {
        organizationId: result.id,
        organizationName: result.companyName,
        email: result?.email,
        phone: result.phone,
        tinNumber: result.tinNumber,
        password: 'C0mplex@123',
        userName: result?.phone ? result?.phone : result?.email,
        status: AccountStatusEnums.ACTIVE,
        createdAt: new Date(),
      };
      const account = await this.accountRepository.save(accountEntity);
      console.log(createCommand);
      return {
        status: AccountStatusEnums.ACTIVE,
        data: response.data,
        result: result,
        account: account,
        message: `One time password is sent to the phone Numner ${
          licenseInformation.data?.AddressInfo.MobilePhone
        }`,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Unable to verify TIN. Please try again');
    }
  }
  private async updateAccountTokens(accountId: string, token: any) {
    const a = await this.accountRepository.update(
      { id: accountId },
      { refreshToken: token.refreshToken, accountToken: token.accessToken },
    );
    return a;
  }
}

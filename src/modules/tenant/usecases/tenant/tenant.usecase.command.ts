/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, MoreThanOrEqual } from 'typeorm';

import axios from 'axios';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import {
  CheckOrganizationFromETrade,
  CreateTenantCommand,
} from './tenant.command';
import { TenantResponse } from './tenant.response';
import { CreateLookupCommand } from '../lookup/lookup.command';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { CreateEmployeeTenantCommand } from '../employee-tenant/employee-tenant.command';
import { TenantSubscriptionTypes } from '../../constants';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { TenantRepository } from '../../persistencies/tenant.repository';
import { LookupRepository } from '../../persistencies/lookup.repository';
import { EmployeeTenantRepository } from '../../persistencies/employee-tenant.repository';
import { EmployeeStatus } from 'src/modules/user/usecase/user.command';
dotenv.config({ path: '.env' });
@Injectable()
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly lookupRepository: LookupRepository,
    private readonly employeeTenantRepository: EmployeeTenantRepository,
  ) {}
  private readonly axiosInstance = axios.create({
    baseURL: 'https://etrade.gov.et/api',
    timeout: 5000,
    headers: {
      Referer: 'https://etrade.gov.et/business-license-checker',
    },
  });
  async migrateTenantSchema(
    newSchemaName: string,
    oldSchemaName: string,
  ): Promise<void> {
    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.PUBLIC_DATABASE_HOST,
      port: +process.env.PUBLIC_DATABASE_PORT,
      username: process.env.PUBLIC_DATABASE_USERNAME,
      password: process.env.PUBLIC_DATABASE_PASSWORD,
      database: process.env.PUBLIC_DATABASE_Name,
      entities: [],
      synchronize: false,
    });
    await dataSource.initialize();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`CREATE SCHEMA  "${newSchemaName}";`);
      const tables = await queryRunner.query(`
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = '${oldSchemaName}';
            `);

      for (const table of tables) {
        const tableName = table.table_name;

        // Step 3.1: Create the table in the new schema using `LIKE` to copy structure
        // if()
        await queryRunner.query(`
                    CREATE TABLE "${newSchemaName}"."${tableName}" 
                    (LIKE "${oldSchemaName}"."${tableName}" INCLUDING ALL);
                `);

        // Step 3.2: Copy data from the old schema to the new schema
        await queryRunner.query(`
              INSERT INTO "${newSchemaName}"."${tableName}"
              SELECT * FROM "${oldSchemaName}"."${tableName}";
          `);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      console.log('finally');
      // await queryRunner.release();
    }
  }
  async updateTenant(command: CreateTenantCommand): Promise<TenantResponse> {
    const tenantEntity = CreateTenantCommand.fromCommand(command);
    tenantEntity.code = tenantEntity.schemaName;
    await this.tenantRepository.update(tenantEntity.id, tenantEntity);
    return TenantResponse.toResponse(tenantEntity);
  }
  async createTenant(command: CreateTenantCommand): Promise<TenantResponse> {
    const tenantEntity = CreateTenantCommand.fromCommand(command);
    const result = await this.tenantRepository.create(tenantEntity);
    const salt = process.env.BCRYPT_SALT;
    const employeeTenant: CreateEmployeeTenantCommand = {
      jobTitle: 'Administrator',
      lookupId: command?.currentUser?.lookupId,
      status: result.status,
      tenantId: result.id,
      tenantName: result.name,
      startDate: new Date(),
    };
    if (!command?.currentUser) {
      const lookup: CreateLookupCommand = {
        email: result.email,
        password: await bcrypt.hash('C0mplex!', salt),
        phoneNumber: command.phoneNumber,
        status: command.status,
        firstName: 'Administrator',
        middleName: 'Administrator',
        lastName: 'Administrator',
        jobTitle: 'Administrator',
        tenantId: result.id,
        tenantName: result.name,
      };
      const lookupEntity = await this.lookupRepository.create(lookup);
      employeeTenant.lookupId = lookupEntity.id;
    }

    const employeeTenantEntity =
      await this.employeeTenantRepository.create(employeeTenant);
    result.organizationEmployees.push(employeeTenantEntity);
    return TenantResponse.toResponse(result);
  }
  async CreateAccounts(command: CreateTenantCommand) {
    if (command?.currentUser)
      throw new BadRequestException(
        `Create You first need to login as Employer`,
      );
    if (!command.phoneNumber && !command.email) {
      throw new BadRequestException(`Phone or email is mandatory`);
    }
    const alreadyExist = await this.tenantRepository.findOne({
      where: [
        {
          email: command.email,
        },
        {
          phoneNumber: command.phoneNumber,
        },
        {
          tin: command.tin,
        },
      ],
    });
    if (alreadyExist)
      throw new ConflictException(
        `Organization already registered with thi email and password`,
      );
    const salt = process.env.BCRYPT_SALT;
    const tenantCommand: CreateTenantCommand = {
      name: command.name,
      tin: command.tin,
      phoneNumber: command.phoneNumber,
      email: command.email,
      companySize: command.companySize,
      industry: command.industry,
      address: command.address,
      isActive: true,
      logo: command.logo,
      subscriptionType: TenantSubscriptionTypes.FREE,
    };
    const tenantEntity: TenantResponse = await this.createTenant(tenantCommand);
    const entity: CreateLookupCommand = {
      password: await bcrypt.hash('C0mplex!', salt),
      email: command.email,
      phoneNumber: command.phoneNumber,
      firstName: 'Root',
      middleName: 'Administrator',
      status: AccountStatusEnums.ACTIVE,
    };
    const lookEntity = await this.lookupRepository.create(entity);
    const employeeOrganizationCommand: CreateEmployeeTenantCommand = {
      tenantId: tenantEntity.id,
      lookupId: command.currentUser.lookupId,
      startDate: new Date(),
      status: EmployeeStatus.ACTIVE,
      tenantName: tenantEntity.name,
      jobTitle: 'Administrator',
    };
    const employeeORganizationEntity =
      await this.employeeTenantRepository.create(employeeOrganizationCommand);
    return { tenantEntity, lookEntity, employeeORganizationEntity };
  }
  async registerOrganizationWithETrade(
    command: CheckOrganizationFromETrade,
  ): Promise<any> {
    try {
      const alreadyExist = await this.tenantRepository.findOne({
        where: { tin: command.tin },
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
      const licenseInformation = await this.getBusinessLicenseFromEtrade(
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
      const salt = process.env.BCRYPT_SALT;
      const createCommand: CreateTenantCommand = {
        name: licenseInformation.data.TradeName,
        tin: command.tin,
        isVerified: true,
        address: licenseInformation.data?.AddressInfo,
        licenseNumber: command.licenseNumber,
        registrationNumber: registrationNumber,
        email: licenseInformation.data.email,
        phoneNumber: licenseInformation.data.AddressInfo.MobilePhone,
      };

      const tenantEntity = await this.createTenant(createCommand);
      const lookupCommand: CreateLookupCommand = {
        email: tenantEntity?.email,
        phoneNumber: tenantEntity.phoneNumber,
        password: await bcrypt.hash('C0mplex!', salt),
        // user: result?.phoneNumber ? result?.phoneNumber : result?.email,
        status: AccountStatusEnums.ACTIVE,
      };
      const lookupEntity = await this.lookupRepository.create(lookupCommand);
      console.log(createCommand);
      const employeeoRganizationCommand: CreateEmployeeTenantCommand = {
        tenantId: tenantEntity.id,
        lookupId: lookupEntity.id,
        startDate: new Date(),
        status: EmployeeStatus.ACTIVE,
        tenantName: tenantEntity.name,
        jobTitle: 'Administrator',
      };
      const employeeORganizationEntity =
        await this.employeeTenantRepository.create(employeeoRganizationCommand);
      return {
        tenantEntity,
        lookupEntity,
        employeeORganizationEntity,
        message: `One time password is sent to the phone Numner ${
          licenseInformation.data?.AddressInfo.MobilePhone
        }`,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Unable to verify TIN. Please try again');
    }
  }
  async generateRegistrationNumber(orgCode = 'TALHUB', serviceCode: string) {
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
    const lastApplication = await this.tenantRepository.findOne({
      where: { createdAt: MoreThanOrEqual(dateFormatted) },
      order: { createdAt: 'DESC' },
    });
    const applicationResult = lastApplication.registrationNumber;
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
  async getTenants(query: CollectionQuery) {
    const response = await this.tenantRepository.findAll(query);
    return response;
  }
}

/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { TenantEntity } from '../persistances/tenant.entity';
import {
  CheckOrganizationFromETrade,
  CreateTenantCommand,
  TenantResponse,
} from '../dtos/tenant.dto';
import { TenantDatabaseService } from '../tenant-database.service';
import { LookupEntity } from '../persistances/lookup.entity';
import { EmployeeOrganizationEntity } from '../persistances/employee-organization.entity';
import { TenantSubscriptionType, UserStatusEnums } from '../constants';
import { CreateLookupCommand } from '../dtos/lookup.dto';
import { CreateEmployeeOrganizationCommand } from '../dtos/employee-organization';
import axios from 'axios';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { QueryConstructor } from 'src/libs/Common/collection-query/query-constructor';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
@Injectable()
export class TenantService {
  constructor(private tenantDatabaseService: TenantDatabaseService) {}
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
    const publicConnection = this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = (await publicConnection).getRepository(
      TenantEntity,
    );
    const tenantEntity = CreateTenantCommand.fromCommand(command);
    tenantEntity.code = tenantEntity.schemaName;
    await tenantRepository.update(tenantEntity.id, tenantEntity);
    return TenantResponse.toResponse(tenantEntity);
  }
  async createTenant(command: CreateTenantCommand): Promise<TenantResponse> {
    const tenantEntity = CreateTenantCommand.fromCommand(command);
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(TenantEntity);
    const result = await tenantRepository.save(tenantEntity);
    const tenants = await tenantRepository.find();
    const tenantCount = tenants?.length > 0 ? tenants.length : 1;
    const schemaName = `_${tenantCount}`;
    tenantEntity.schemaName = schemaName;
    tenantEntity.code = schemaName;
    await tenantRepository.update(tenantEntity.id, tenantEntity);
    const defaultSchema = 'Demo';
    await this.migrateTenantSchema(schemaName, defaultSchema);
    return TenantResponse.toResponse(result);
  }

  async CreateAccounts(command: CreateTenantCommand) {
    if (!command.phoneNumber && !command.email) {
      throw new BadRequestException(`Phone or email is mandatory`);
    }
    const publicConnection: DataSource =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(TenantEntity);
    const lookupRepository = publicConnection.getRepository(LookupEntity);
    const employeeOrganizationRepository = publicConnection.getRepository(
      EmployeeOrganizationEntity,
    );
    const alreadyExist = await tenantRepository.findOne({
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
      throw new ConflictException(`Organization already exists`);

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
      subscriptionType: TenantSubscriptionType.FREE,
    };
    const tenantEntity: TenantResponse = await this.createTenant(tenantCommand);
    const entity: CreateLookupCommand = {
      password: 'C0mplex@123',
      email: command.email,
      phoneNumber: command.phoneNumber,
      firstName: 'Root',
      middleName: 'Administrator',
      status: UserStatusEnums.ACTIVE,
    };
    const lookEntity = await lookupRepository.save(entity);
    const employeeoRganizationCommand: CreateEmployeeOrganizationCommand = {
      tenantId: tenantEntity.id,
      lookupId: lookEntity.id,
      startDate: new Date(),
      status: UserStatusEnums.ACTIVE,
      tenantName: tenantEntity.name,
      jobTitle: 'Administrator',
    };
    const employeeORganizationEntity =
      await employeeOrganizationRepository.save(employeeoRganizationCommand);
    return { tenantEntity, lookEntity, employeeORganizationEntity };
  }
  async registerOrganizationWithETrade(
    command: CheckOrganizationFromETrade,
  ): Promise<any> {
    try {
      const publicConnection =
        await this.tenantDatabaseService.getPublicConnection();
      const tenantRepository = publicConnection.getRepository(TenantEntity);
      const lookupRepository = publicConnection.getRepository(LookupEntity);
      const employeeOrganizationRepository = publicConnection.getRepository(
        EmployeeOrganizationEntity,
      );
      const alreadyExist = await tenantRepository.findOne({
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
        password: 'C0mplex@123',
        // user: result?.phoneNumber ? result?.phoneNumber : result?.email,
        status: UserStatusEnums.ACTIVE,
      };
      const lookupEntity = await lookupRepository.save(lookupCommand);
      console.log(createCommand);
      const employeeoRganizationCommand: CreateEmployeeOrganizationCommand = {
        tenantId: tenantEntity.id,
        lookupId: lookupEntity.id,
        startDate: new Date(),
        status: UserStatusEnums.ACTIVE,
        tenantName: tenantEntity.name,
        jobTitle: 'Administrator',
      };
      const employeeORganizationEntity =
        await employeeOrganizationRepository.save(employeeoRganizationCommand);
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
  async generateRegistrationNumber(orgCode = 'IFHCRS', serviceCode: string) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(TenantEntity);
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
    const applicationResult = await tenantRepository.count({
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
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(TenantEntity);
    return await tenantRepository.find({
      where: { id: id },
      relations: { organizationEmployees: true },
    });
  }
  async getTenants(query: CollectionQuery) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(TenantEntity);
    const dataQuery = QueryConstructor.constructQuery<TenantEntity>(
      tenantRepository,
      query,
    );

    const response = new DataResponseFormat<TenantResponse>();
    if (query.count) {
      response.total = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      response.total = total;
      response.items = result;
    }
    return response;
  }
}

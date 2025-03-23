import { BadRequestException, Injectable } from '@nestjs/common';
import { TenantResponse } from './tenant.response';
import { CreateTenantCommand } from './tenant.command';
import { DataSource, In } from 'typeorm';
import { TenantEntity } from 'modules/tenant-database/persistance/tenat.entity';
import { FileManagerService } from '@libs/common/file-manager';
import { TenantDatabaseService } from '../tenant-database.service';
import { LookUpEntity } from 'modules/tenant-database/persistance/look-up-table.entity';
import { EmployeeStatus } from '@libs/common/enums';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserInfo } from '@libs/common/user-info';
import { EmployeeEntity } from '@employee/persistences/employees/employee.entity';
import { EmployeeOrganizationEntity } from 'modules/tenant-database/persistance/employee-organizations.entity';
import { CreateEmployeeOrganizationCommand } from '../employees-Organization/employee-orgaization.command';
import { CreateLookUpCommand } from '../look-up/look-up.command';
import { Util } from '@libs/common/util';
import { TenantServiceProviderCommand } from '../service-provider.service';
import { CreateEmployeeCommand } from '@employee/usecases/employees/employee.commands';

@Injectable()
export class TenantCommand {
  constructor(
    private readonly fileManagerService: FileManagerService,
    private tenantDatabaseService: TenantDatabaseService,
    private tenantServiceProviderCommand: TenantServiceProviderCommand,
    // private employeeOrganizationRepository: EmployeeOrganizationRepository,
  ) {}
  private activeEmployeesStatus = [
    EmployeeStatus.ACTIVE,
    EmployeeStatus.ON_LEAVE,
    EmployeeStatus.ON_PROBATION,
  ];
  async migrateSchema(
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
  async updateWifiInfo(wifiInfo: any, tenantId: string) {
    const publicConnection: DataSource =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository =  publicConnection.getRepository(TenantEntity);
    const tenantInformation = await tenantRepository.findOne({
      where: { id: +tenantId },
    });
    if (!tenantInformation) throw new BadRequestException(`Tenant not found`);
    tenantInformation.wifiInfo =wifiInfo;
    const result = await tenantRepository.save(
      tenantInformation,
    );
  return  result
  }
  async updateLocation(location: any, tenantId: string) {
    const publicConnection: DataSource =
      await this.tenantServiceProviderCommand.getPublicConnection();
    const tenantRepository = await publicConnection.getRepository(TenantEntity);
    const tenantInformation = await tenantRepository.findOne({
      where: { id: +tenantId },
    });
    if (!tenantInformation) throw new BadRequestException(`Tenant not found`);
    tenantInformation.location =location;
    const result = await tenantRepository.save(
      tenantInformation,
    );
  return  result
  }
  async createLookUp(SchemaName: string, tenantId: number) {
    const connection =
      await this.tenantDatabaseService.getConnection(SchemaName);
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const employeeRepository = connection.getRepository(EmployeeEntity);
    const lookupRepository = publicConnection.getRepository(LookUpEntity);
    const employees = await employeeRepository.find({
      where: { status: EmployeeStatus.ACTIVE },
    });
    if (employees.length > 0) {
      for (let index = 0; index < employees.length; index++) {
        const element: EmployeeEntity = employees[index];

        const lookUpCommand: CreateLookUpCommand = {
          email: element.email,
          firstName: element.firstName,
          fullName:
            element.firstName +
            ' ' +
            element.middleName +
            ' ' +
            element.lastName,
          hasBackOfficeAccess: element.hasBackOfficeAccess,
          jobTitle: element.jobTitle,
          lastName: element.lastName,
          employeeId: element.id,
          middleName: element.middleName,
          // organizationSchemaName: SchemaName,
          status: element.status,
          tenantId: tenantId,
          tin: element.tin,
          currentUser: null,
          id: Util.generateId(LookUpEntity, tenantId.toString()),
          password: element.password,
          phoneNumber: element.phoneNumber,
        };
        const lookUpEntity = CreateLookUpCommand.fromCommand(lookUpCommand);
        const result = await lookupRepository.save(lookUpEntity);
        return result;
      }
    }
  }
  async createEmployeeOrganization(
    SchemaName: string,
    tenantId: number,
    employeeId: string,
    lookup: LookUpEntity,
  ) {
    const connection =
      await this.tenantDatabaseService.getConnection(SchemaName);
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const employeeOrganizationRepository = publicConnection.getRepository(
      EmployeeOrganizationEntity,
    );
    if (lookup) {
      const employeeOrganizationCommand: CreateEmployeeOrganizationCommand = {
        employeeId: employeeId,
        id: Util.generateId(EmployeeOrganizationEntity, tenantId.toString()),
        lookupId: lookup.id,
        startDate: null,
        status: lookup.status,
        tenantId: tenantId,
        currentUser: null,
      };
      const employeeOrganizationEntity =
        CreateEmployeeOrganizationCommand.fromCommand(
          employeeOrganizationCommand,
        );
      const result = await employeeOrganizationRepository.save(
        employeeOrganizationEntity,
      );
      return result;
    }
  }
  async createTenant(command: CreateTenantCommand): Promise<any> {
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
    const tenantEntity = CreateTenantCommand.fromCommand(command);
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const publicConnection = this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = (await publicConnection).getRepository(
      TenantEntity,
    );
    const result = await tenantRepository.save(tenantEntity);
    const schemaName = `_${result.id}`;
    tenantEntity.schemaName = schemaName;
    tenantEntity.code = schemaName;
    await tenantRepository.update(tenantEntity.id, tenantEntity);
    const defaultSchema = 'Demo_11019';
    await this.migrateSchema(schemaName, defaultSchema);
    return result;
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
  async uploadFile(file: Express.Multer.File, id: number): Promise<string> {
    const publicConnection = this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = (await publicConnection).getRepository(
      TenantEntity,
    );
    const tenant = await tenantRepository.findOne({ where: { id: id } });
    if (!tenant) throw new BadRequestException(`tenant Not Found`);
    const mimetype = file.mimetype.split('/')[1];
    const fileName = file.originalname;
    if (!mimetype) throw new BadRequestException(`file mime type is required`);
    const fileId = `${tenant.id}_${fileName}.${mimetype}`;
    if (tenant.logo) {
      const oldFileId = tenant.logo.filename;
      await this.fileManagerService.deleteBucketFile(oldFileId);
    }
    const res = await this.fileManagerService.uploadBucketFile(file, fileId);
    const publicUrl = `https://storage.googleapis.com/${res.bucketName}/${res.filename}`;
    tenant.logo = {
      ...res,
      path: publicUrl,
    };
    await tenantRepository.update(tenant.id, tenant);
    return publicUrl;
  }
  async getTenantsByToken(decodedToken: any) {
    const connection = await this.tenantDatabaseService.getPublicConnection();
    const lookUpRepository = connection.getRepository(LookUpEntity);
    const lookUpData: LookUpEntity = await lookUpRepository.findOne({
      where: {
        phoneNumber: decodedToken.phoneNumber,
        employeeOrganization: { status: In(this.activeEmployeesStatus) },
      },
      relations: { employeeOrganization: { organization: true } },
    });
    const tenants = lookUpData.employeeOrganization.map(
      (item) => item.organization,
    );
    return tenants.map((item) => TenantResponse.toResponse(item));
  }
  async dropDatabase(@CurrentUser() user: UserInfo) {
    const schemaName = user.organizationSchemaName;
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    await publicConnection.query(
      `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;`,
    );
    const connection = await this.tenantDatabaseService.getConnection(
      user.organizationSchemaName,
    );
    const employeeOrganizationRepository = publicConnection.getRepository(
      EmployeeOrganizationEntity,
    );
    const employeeRepository = connection.getRepository(
      EmployeeOrganizationEntity,
    );
    // const res=await employeeOrganizationRepository.delete({tenantId:user.tenantId})
    const employee: CreateEmployeeCommand = new CreateEmployeeCommand();
    // employee.address=user.address
    // employee.=user.
    const emp = employeeRepository.save(employee);
    const employeeOrganizationCommand: CreateEmployeeOrganizationCommand = {
      employeeId: user.id,
      id: Util.generateId(EmployeeOrganizationEntity, user.tenantId.toString()),
      lookupId: user.lookupId,
      startDate: new Date(),
      status: EmployeeStatus.ACTIVE,
      tenantId: user.tenantId,
      currentUser: null,
    };
    const res = await employeeOrganizationRepository.save(
      employeeOrganizationCommand,
    );
  }
  async repopulateSchema(@CurrentUser() user: UserInfo) {
    const schemaName = user.organizationSchemaName;
    const defaultSchema = '_11000';
    await this.migrateSchema(schemaName, defaultSchema);
    return true;
  }
}

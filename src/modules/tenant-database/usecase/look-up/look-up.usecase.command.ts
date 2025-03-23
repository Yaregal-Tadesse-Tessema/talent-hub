import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLookUpCommand } from './look-up.command';
import { LookUpResponse } from './look-up.response';
import { LookUpEntity } from 'modules/tenant-database/persistance/look-up-table.entity';
import { CreateEmployeeCommand } from '@employee/usecases/employees/employee.commands';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Util } from '@libs/common/util';
import { TenantEntity } from 'modules/tenant-database/persistance/tenat.entity';
import { EmployeeResponse } from '@employee/usecases/employees/employee.response';
import { EmployeeEntity } from '@employee/persistences/employees/employee.entity';
import { TenantDatabaseService } from '../tenant-database.service';
import {
  AccrualRate,
  EmployeeStatus,
  EmploymentType,
} from '@libs/common/enums';
import { LeavePolicesEntity } from '@leaves/persistences/leave-policy/leave-policy.entity';
import { LeaveBalanceEntity } from '@leaves/persistences/leave-balance/leave-balance.entity';
import { CreateLeaveBalanceCommand } from '@leaves/usecases/leave-balance/leave-balance.command';
import { LeaveBalanceResponse } from '@leaves/usecases/leave-balance/leave-balance.response';
import { REQUEST } from '@nestjs/core';
import { CreateEmployeeOrganizationCommand } from '../employees-Organization/employee-orgaization.command';
import { EmployeeOrganizationEntity } from 'modules/tenant-database/persistance/employee-organizations.entity';
import { EmployeeOrganizationsResponse } from '../employees-Organization/organization-employees.response';
import { UserInfo } from '@libs/common/user-info';
import { TenantServiceProviderCommand } from '../service-provider.service';

@Injectable()
export class LookUpCommand {
  constructor(
    @InjectRepository(LookUpEntity)
    private readonly lookUpRepository: Repository<LookUpEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
    private readonly tenantDatabaseService: TenantDatabaseService,
    @InjectRepository(EmployeeOrganizationEntity)
    private readonly employeeOrganizationRepository: Repository<EmployeeOrganizationEntity>,

    @Inject(REQUEST) private request: Request,
  ) {}
  async createLookUp(command: CreateLookUpCommand): Promise<LookUpResponse> {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(TenantEntity);
    const lookUpRepository = publicConnection.getRepository(LookUpEntity);
    const employeeOrganizationRepository = publicConnection.getRepository(
      EmployeeOrganizationEntity,
    );
    let employee: CreateEmployeeCommand = null;
    employee = { ...employee, ...command,fullName:null };
    employee.password = Util.hashPassword(command.password);
    employee.status = EmployeeStatus.ACTIVE;
    const tenant = await tenantRepository.findOne({
      where: { id: command.tenantId },
    });
    const res = await this.createEmployee(
      employee,
      tenant.schemaName,
      tenant.name,
    );
    // command.employeeId = res.id;
    command.tenantId = command.tenantId;
    command.id = Util.generateStripeId(
      await Reflect.getMetadata('prefix', EmployeeOrganizationEntity),
    );
    const lookUpEntity = CreateLookUpCommand.fromCommand(command);
    let lookup = await lookUpRepository.findOne({
      where: { phoneNumber: command.phoneNumber },
    });
    if (!lookup) {
      lookUpEntity.password = Util.hashPassword(command.password);
      lookup = await lookUpRepository.save(lookUpEntity);
    }
    const eo = await employeeOrganizationRepository.findOne({
      where: { lookupId: lookup.id, tenantId: command.tenantId },
    });
    if (eo) return LookUpResponse.toResponse(lookUpEntity);
    await employeeOrganizationRepository.save({
      id: Util.generateStripeId(
        await Reflect.getMetadata('prefix', EmployeeOrganizationEntity),
      ),
      lookupId: lookup.id,
      employeeId: command.currentUser.id,
      tenantId: command.tenantId,
      startDate: new Date(),
      status: EmployeeStatus.ACTIVE,
    });
    const result = LookUpResponse.toResponse(lookUpEntity);
    return result;
  }
  async updateLookUp(command: CreateLookUpCommand): Promise<LookUpResponse> {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantRepository = publicConnection.getRepository(TenantEntity);
    const lookUpRepository = publicConnection.getRepository(LookUpEntity);
    const lup = await lookUpRepository.findOne({
      where: { phoneNumber: command.phoneNumber },
    });
    const lookUpEntity = CreateLookUpCommand.fromCommand(command);
    lookUpEntity.password = command.password
      ? command.password == ''
        ? lup.password
        : Util.hashPassword(command.password)
      : lup.password;

    const response = LookUpResponse.toResponse(
      await lookUpRepository.save(lookUpEntity),
    );
    if (command?.hasBackOfficeAccess==true||command?.hasBackOfficeAccess==false) {
      const employeeOrganizationRepository = publicConnection.getRepository(
        EmployeeOrganizationEntity
      );
      const eo = await employeeOrganizationRepository.findOne({
        where: { lookupId: command.id,tenantId:command.tenantId, },
        relations: { organization: true },
      });
      const tenant = eo.organization
      const connection = await this.tenantDatabaseService.getConnection(
        tenant.schemaName,
      );
      const employeeRepository = connection.getRepository(EmployeeEntity);
      const res = await employeeRepository.update(
        { id: response.employeeId },
        { hasBackOfficeAccess: command.hasBackOfficeAccess },
      );
    }

    let employee: CreateEmployeeCommand = null;
    employee = { ...employee, ...command,fullName:null };
    employee.password = lookUpEntity.password;
    return response;
  }
  @OnEvent('employee.created')
  async handleOrderCreatedEvent(payload: CreateLookUpCommand) {
    const connection = payload.connection;
    const repo = connection.getRepository(LookUpEntity);
    const entity = CreateLookUpCommand.fromCommand(payload);
    const res = await repo.save(entity);
    console.log(res);
  }
  async createEmployee(
    command: CreateEmployeeCommand,
    schemaName: string,
    tenantName: string,
  ): Promise<EmployeeResponse> {
    const connection: DataSource =
      await this.tenantDatabaseService.getConnection(schemaName);
    const employeeRepository = connection.getRepository(EmployeeEntity);
    const emp = await employeeRepository.findOne({
      where: { phoneNumber: command.phoneNumber },
    });
    if (emp) {
      return EmployeeResponse.toResponse(emp);
      // throw new BadRequestException(
      //   `Employee already exist with this phone number`,
      // );
    }
    const data = await employeeRepository.findOne({
      where: { email: command.email },
    });
    if (command.email && data) {
      return EmployeeResponse.toResponse(data);
      // throw new BadRequestException(
      //   `Employee already exist with this email Address`,
      // );
    }
    const empl = await employeeRepository.findOne({
      where: { workEmail: command.workEmail },
    });
    if (command.workEmail && empl) {
      return EmployeeResponse.toResponse(empl);
      // throw new BadRequestException(
      //   `Employee already exist with this Work Email Address`,
      // );
    }
    const employeeDomain = CreateEmployeeCommand.fromCommand(command);
    employeeDomain.id = Util.addAdditionalPrefix(
      Util.generateStripeId(
        await Reflect.getMetadata('prefix', EmployeeOrganizationEntity),
      ),
      tenantName.toLocaleLowerCase(),
    );
    if (command.password)
      employeeDomain.password = Util.hashPassword(command.password);
    employeeDomain.status =
      command.employmentType == EmploymentType.PERMANENT
        ? EmployeeStatus.ON_PROBATION
        : EmployeeStatus.ACTIVE;
    const employee = await employeeRepository.save(employeeDomain);

    // const assignedLeavePolices: any[] = [];

    // const leavePolicyRepository = connection.getRepository(LeavePolicesEntity);
    // const assignedLeavePolicyRepository = connection.getRepository(
    //   AssignedLeavePolicyEntity,
    // );

    // const standardLeavePolicies = await leavePolicyRepository.find({
    //   where: {
    //     isStandard: true,
    //   },
    // });
    // for (let index = 0; index < standardLeavePolicies?.length; index++) {
    //   const leavePolicy = standardLeavePolicies[index];
    //   const isPaternityForFemale =
    //     leavePolicy.name === 'Paternity Leave' && employee?.gender === 'Female';
    //   const isMaternityForMale =
    //     leavePolicy.name === 'Maternity Leave' && employee?.gender === 'Male';

    //   if (isPaternityForFemale || isMaternityForMale) {
    //     continue;
    //   }
    //   const assignedLeavePolicy = CreateAssignedLeavePolicyCommand.fromCommand({
    //     leavePolicyId: standardLeavePolicies[index].id,
    //     employeeId: employee.id,
    //     currentUser: command.currentUser,
    //   });
    //   const accruedDay =
    //     standardLeavePolicies[index].accrualPeriod == AccrualRate.ANNUAL
    //       ? standardLeavePolicies[index].duration
    //       : 0;
    //   assignedLeavePolicy.accruedLeave = accruedDay;
    //   assignedLeavePolicy.id = Util.addAdditionalPrefix(
    //     Util.generateStripeId(leavePolicyRepository.metadata.targetName),
    //     tenantName,
    //   );
    //   const assignedLeavePolicyResponse =
    //     await assignedLeavePolicyRepository.save(assignedLeavePolicy);
    //   assignedLeavePolicyResponse.leavePolicy = standardLeavePolicies[index];
    //   if (!assignedLeavePolicyResponse)
    //     throw new BadRequestException(
    //       `Saving assign leave policy to employee failed`,
    //     );

    //   const leaveBalance = await this.addLeaveBalance(
    //     employee.id,
    //     standardLeavePolicies[index].id,
    //     command?.currentUser,
    //     schemaName,
    //     tenantName,
    //   );
    //   assignedLeavePolices.push(assignedLeavePolicyResponse);
    //   assignedLeavePolices.push(leaveBalance);
    // }
    // employee.assignedLeavePolices = assignedLeavePolices;
    return EmployeeResponse.toResponse(employee);
  }
  async addLeaveBalance(
    employeeId: string,
    leavePolicyId: string,
    currentUser: any,
    schemaName: string,
    tenantName: string,
  ) {
    const connection: DataSource =
      await this.tenantDatabaseService.getConnection(schemaName);
    const leavePolicyRepository = connection.getRepository(LeavePolicesEntity);
    const leaveBalanceRepository = connection.getRepository(LeaveBalanceEntity);

    const leavePolicy = await leavePolicyRepository.findOne({
      where: { id: leavePolicyId },
      relations: { assignedEmployees: true },
    });
    if (!leavePolicy) throw new NotFoundException('leave policy not found');

    const balance =
      leavePolicy.accrualPeriod == AccrualRate.THROUGH_YEAR
        ? 0
        : leavePolicy.duration;

    const oldBalance = await leaveBalanceRepository.findOne({
      where: { employeeId: employeeId, leavePolicyId: leavePolicyId },
    });
    // const total = oldBalance ? oldBalance.total + balance : balance;
    const leaveBalanceEntity = CreateLeaveBalanceCommand.fromCommand({
      id: oldBalance ? oldBalance.id : undefined,
      balance: balance,
      employeeId: employeeId,
      leavePolicyId: leavePolicyId,
      year: new Date().getFullYear(),
      // total: total,
      currentUser: currentUser,
    });
    leaveBalanceEntity.id = Util.addAdditionalPrefix(
      Util.generateStripeId(leavePolicyRepository.metadata.targetName),
      tenantName,
    );
    const result = await leaveBalanceRepository.save(leaveBalanceEntity);
    if (!result)
      throw new BadRequestException('error while adding leave balance');
    return LeaveBalanceResponse.toResponse(result);
  }
  async moveAllLookUpsToEmployeeOrganization(user: UserInfo) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const tenantId = await this.request['TENANT_Id'];
    const employeeOrganizationRepository = publicConnection.getRepository(
      EmployeeOrganizationEntity,
    );

    const lookUpRepository = publicConnection.getRepository(LookUpEntity);
    const lookUp = await lookUpRepository.find();
    const employeeOrganizationMappings: CreateEmployeeOrganizationCommand[] =
      [];
    const prefix = Reflect.getMetadata('prefix', EmployeeOrganizationEntity);
    for (let index = 0; index < lookUp?.length; index++) {
      const element = lookUp[index];
      const employeeOrganizationMapping: CreateEmployeeOrganizationCommand = {
        id: Util.generateStripeId(prefix),
        lookupId: element.id,
        startDate: null,
        status: EmployeeStatus.ACTIVE,
        tenantId: tenantId,
        employeeId: user?.id,
        currentUser: user,
      };
      employeeOrganizationMappings.push(
        CreateEmployeeOrganizationCommand.fromCommand(
          employeeOrganizationMapping,
        ),
      );
    }
    const result = await employeeOrganizationRepository.save(
      employeeOrganizationMappings,
    );
    return result.map((item) => EmployeeOrganizationsResponse.toResponse(item));
  }
  async archiveLookup(lookupId: string, tenantId: number) {
    const publicConnection =
      await this.tenantDatabaseService.getPublicConnection();
    const employeeOrganizationRepository = publicConnection.getRepository(
      EmployeeOrganizationEntity,
    );
    const eo = await employeeOrganizationRepository.findOne({
      where: { lookupId: lookupId, tenantId: tenantId },
      relations: { organization: true, lookup: true },
    });
    if (!eo || eo?.organization?.schemaName)
      throw new BadRequestException(`Employee is not in this organization`);
    const connection = await this.tenantDatabaseService.getConnection(
      eo.organization.schemaName,
    );
    const employeeRepository = connection.getRepository(EmployeeEntity);
    await employeeRepository.update(
      { id: eo.employeeId },
      { status: EmployeeStatus.INACTIVE },
    );
    const result = await employeeOrganizationRepository.softDelete({
      lookupId: lookupId,
      tenantId: tenantId,
    });
    if (result.affected > 0) return true;
    return false;
  }
}

import { ResetPasswordTokenEntity } from '@auth/persistences/reset-password/reset-password.entity';
import { SessionEntity } from '@auth/persistences/sessions/session.entity';
import { BankEntity } from '@bank/persistences/banks/bank.entity';
import { BranchContactEntity } from '@bank/persistences/branches/branch-contact.enetity';
import { BranchEntity } from '@bank/persistences/branches/branch.entity';
import { BenefitTypeEntity } from '@configurations/persistences/benefit-types/benefit-type.entity';
import { DeductionTypeEntity } from '@configurations/persistences/deduction-types/deduction-type.entity';
import { DepartmentEntity } from '@configurations/persistences/departments/department.entity';
import { DocumentTypeEntity } from '@configurations/persistences/document-types/document-type.entity';
import { EarningTypeEntity } from '@configurations/persistences/earning-types/earning-type.entity';
import { IncomeTaxPolicyEntity } from '@configurations/persistences/income-tax-policies/income-tax-policy.entity';
import { OrganizationBankAccountEntity } from '@configurations/persistences/organization-bank-accounts/organization-bank-account.entity';
import { PayPeriodConfigEntity } from '@configurations/persistences/pay-period-config/pay-period-config-entity';
import { PayPeriodEntity } from '@configurations/persistences/pay-periods/pay-period-entity';
import { DocumentEntity } from '@employee/persistences/employee-documet/employee-document.entity';
import { AssignedLeavePolicyEntity } from '@employee/persistences/employees/assigned-leave-policy.entity';
import { EmployeeBankAccountEntity } from '@employee/persistences/employees/employee-bank-account.entity';
import { EmployeeBenefitEntity } from '@employee/persistences/employees/employee-benefit.entity';
import { EmployeeDeductionEntity } from '@employee/persistences/employees/employee-deduction.entity';
import { EmployeeEarningEntity } from '@employee/persistences/employees/employee-earning.entity';
import { EmployeeNoteEntity } from '@employee/persistences/employees/employee-note.entity';
import { EmployeeRoleEntity } from '@employee/persistences/employees/employee-role.entity';
import { EmployeeEntity } from '@employee/persistences/employees/employee.entity';
import { LeaveBalanceEntity } from '@leaves/persistences/leave-balance/leave-balance.entity';
import { LeavePolicesEntity } from '@leaves/persistences/leave-policy/leave-policy.entity';
import { LeaveRequestEntity } from '@leaves/persistences/leave-requests/leave-request.entity';
import { LeaveTypeEntity } from '@leaves/persistences/leave-types/leave-type.entity';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EmployeePayrollBenefitEntity } from '@payroll/persistences/employee-payrolls/employee-payroll-benefit.entity';
import { EmployeePayrollDeductionEntity } from '@payroll/persistences/employee-payrolls/employee-payroll-deduction.entity';
import { EmployeePayrollEarningEntity } from '@payroll/persistences/employee-payrolls/employee-payroll-earning.entity';
import { EmployeePayrollEntity } from '@payroll/persistences/employee-payrolls/employee-payroll.entity';
import { PayrollRunEntity } from '@payroll/persistences/payroll-runs/payroll-run.entity';
import { PensionHistoryEntity } from '@payroll/persistences/pension-histories/pension-history.entity';
import { PensionTaxHistoryEntity } from '@payroll/persistences/tax-histories/pension-tax-history.entity';
import { TaxHistoryEntity } from '@payroll/persistences/tax-histories/tax-history.entity';
import { CreditSettingEntity } from 'modules/credit-purchase/persistences/credit-setting/credit-setting.entity';
import { CreditEntity } from 'modules/credit-purchase/persistences/credit/credit.entity';
import { CreditRepaymentEntity } from 'modules/credit-purchase/persistences/repayment/credit-repayment.entity';
import { EmployeeLettersEntity } from 'modules/letters/persistances/employee-letter/employee-letter.entity';
import { LetterTemplatesEntity } from 'modules/letters/persistances/letter-template/letter-template.entity';
import { LettersEntity } from 'modules/letters/persistances/letter/letter.entity';
import { HolidayEntity } from 'modules/loan/persistences/holidays/holidays.entity';
import { LoanRepaymentEntity } from 'modules/loan/persistences/loan-repayment/loan-repayemnt.entity';
import { LoanSettingEntity } from 'modules/loan/persistences/loan-setting/loan-setting.entity';
import { LoanEntity } from 'modules/loan/persistences/loans/loan.entity';
import { AttendanceEntity } from 'modules/shift-mangement/persistences/attendance/attendance.entity';
import { OvertimeTypeEntity } from 'modules/shift-mangement/persistences/overtime-type/overtime-type.entity';
import { ShiftEntity } from 'modules/shift-mangement/persistences/shift/daily-shift/shift.entity';
import { DailyShiftAssignmentEntity } from 'modules/shift-mangement/persistences/shift/shift-assignment/daily_shift_assignment.entity';
import { WeeklyShiftAssignmentEntity } from 'modules/shift-mangement/persistences/shift/shift-assignment/weekly_shift_assignment.entity';
import { WeeklyShiftEntity } from 'modules/shift-mangement/persistences/shift/weekly-shift/weekly-shift.entity';
import { PayrollTimeSheetEntity } from 'modules/shift-mangement/persistences/time-sheet/payroll-time-sheet.entity';
import { DataSource } from 'typeorm';
import { TenantEntity } from '../persistance/tenat.entity';
import { LookUpEntity } from '../persistance/look-up-table.entity';
import * as dotenv from 'dotenv';
import { AdminUserEntity } from '../persistance/admin-user.entity';
import { PermissionEntity } from 'modules/authorization/permission/persistences/permission.entity';
import { RolePermissionEntity } from 'modules/authorization/role-permission/persistances/role-permission.entity';
import { RoleEntity } from 'modules/authorization/role/persistences/role.entity';
import { EmployeeOrganizationEntity } from '../persistance/employee-organizations.entity';
import { WorkFromHomeEntity } from 'modules/work-from-home/persistances/work-from-homes/work-from-home.entity';
import { ServiceAgreementsEntity } from 'modules/service-aggrement/persistances/service-aggrements/service-agreements.entity';
import { ServicePaymentsEntity } from 'modules/service-aggrement/persistances/service-payments/service-payment.entity';
import { ActionsEntity } from 'modules/action/persistances/actions/action.entity';
import { ApproversEntity } from 'modules/approvers/persistances/approvers/approver.entity';
import { PayGroupEntity } from 'modules/pay-group/persistences/pay-group/pay-group.entity';
import { OrganizationBranchEntity } from 'modules/branch/persistences/organization-branch.entity';
import { EducationEntity } from '@employee/persistences/education/education.entity';
import { LetterRequestEntity } from 'modules/letters/persistances/letter-request/letter-request.entity';
import { DeviceTokenEntity } from 'modules/notification/persistances/device-token.entity';
dotenv.config({ path: '.env' });
@Injectable()
export class TenantDatabaseService implements OnModuleInit, OnModuleDestroy {
  private connections: Map<string, DataSource> = new Map();
  async getConnection(tenantSchema: string): Promise<DataSource> {
    if (this.connections.has(tenantSchema)) {
      return this.connections.get(tenantSchema);
    }
    const connection = new DataSource({
      type: 'postgres',
      host: process.env.PUBLIC_DATABASE_HOST,
      port: +process.env.PUBLIC_DATABASE_PORT,
      username: process.env.PUBLIC_DATABASE_USERNAME,
      password: process.env.PUBLIC_DATABASE_PASSWORD,
      database: process.env.PUBLIC_DATABASE_Name,
      schema: tenantSchema,
      entities: [
        EmployeeEntity,
        DocumentTypeEntity,
        EarningTypeEntity,
        DeductionTypeEntity,
        OrganizationBankAccountEntity,
        EmployeeRoleEntity,
        EmployeeBankAccountEntity,
        EmployeeEarningEntity,
        EmployeeDeductionEntity,
        EmployeeNoteEntity,
        IncomeTaxPolicyEntity,
        BankEntity,
        BranchEntity,
        BranchContactEntity,
        PayrollRunEntity,
        EmployeePayrollEntity,
        EmployeePayrollEarningEntity,
        EmployeePayrollDeductionEntity,
        ResetPasswordTokenEntity,
        SessionEntity,
        PensionHistoryEntity,
        LeaveTypeEntity,
        LeaveRequestEntity,
        AssignedLeavePolicyEntity,
        PayPeriodEntity,
        BenefitTypeEntity,
        EmployeeBenefitEntity,
        TaxHistoryEntity,
        PayPeriodConfigEntity,
        ShiftEntity,
        WeeklyShiftEntity,
        LoanEntity,
        LoanRepaymentEntity,
        CreditEntity,
        CreditSettingEntity,
        CreditRepaymentEntity,
        WeeklyShiftAssignmentEntity,
        DailyShiftAssignmentEntity,
        AttendanceEntity,
        LoanSettingEntity,
        LeavePolicesEntity,
        LeaveBalanceEntity,
        OvertimeTypeEntity,
        PayrollTimeSheetEntity,
        EmployeePayrollBenefitEntity,
        HolidayEntity,
        LettersEntity,
        EmployeeLettersEntity,
        PensionTaxHistoryEntity,
        LettersEntity,
        EmployeeLettersEntity,
        LetterTemplatesEntity,
        DocumentEntity,
        PermissionEntity,
        RolePermissionEntity,
        RoleEntity,
        WorkFromHomeEntity,
        ServiceAgreementsEntity,
        ServicePaymentsEntity,
        ActionsEntity,
        ApproversEntity,
        PayGroupEntity,
        DepartmentEntity,
        OrganizationBranchEntity,
        EducationEntity,
        LetterRequestEntity,
      ],
      synchronize: process.env.PUBLIC_DATABASE_SYNCHRONIZATION == 'true' ? true : false,
    });
    await connection.initialize();
    this.connections.set(tenantSchema, connection);
    return connection;
  }
  async getPublicConnection(): Promise<DataSource> {
    const connection = new DataSource({
      type: 'postgres',
      host: process.env.PUBLIC_DATABASE_HOST,
      port: +process.env.PUBLIC_DATABASE_PORT,
      username: process.env.PUBLIC_DATABASE_USERNAME,
      password: process.env.PUBLIC_DATABASE_PASSWORD,
      database: process.env.PUBLIC_DATABASE_Name,
      schema: 'public',
      entities: [
        SessionEntity,
        TenantEntity,
        LookUpEntity,
        AdminUserEntity,
        EmployeeOrganizationEntity,
        DeviceTokenEntity
      ],
      synchronize:
        process.env.PUBLIC_DATABASE_SYNCHRONIZATION == 'true' ? true : false,
    });
    await connection.initialize();
    this.connections.set('public', connection);
    return connection;
  }
  async onModuleDestroy() {
    for (const connection of this.connections.values()) {
      await connection.destroy();
    }
  }
  async onModuleInit() {
    await this.getPublicConnection();
  }
}

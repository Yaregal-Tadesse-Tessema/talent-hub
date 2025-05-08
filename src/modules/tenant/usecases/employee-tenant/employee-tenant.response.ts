/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { EmployeeTenantEntity } from "../../persistencies/employee-tenant.entity";
import { CreateEmployeeTenantCommand } from "./employee-tenant.command";

export class EmployeeTenantResponse extends CreateEmployeeTenantCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  static toResponse(entity: EmployeeTenantEntity): EmployeeTenantResponse {
    const response = new EmployeeTenantEntity();
    response.id = entity?.id;
    response.tenantId = entity.tenantId;
    response.lookupId = entity.lookupId;
    response.startDate = entity.startDate;
    response.status = entity.status;
    response.jobTitle = entity.jobTitle;
    response.tenantName = entity.tenantName;
    return response;
  }
}

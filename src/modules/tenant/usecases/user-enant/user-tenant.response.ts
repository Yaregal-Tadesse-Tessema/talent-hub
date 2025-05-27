/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { CreateUserTenantCommand } from "./user-tenant.command";
import { UserTenantEntity } from "../../persistencies/user-tenant.entity";

export class UserTenantResponse extends CreateUserTenantCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  static toResponse(entity: UserTenantEntity): UserTenantResponse {
    const response = new UserTenantEntity();
    response.id = entity?.id;
    response.tenantId = entity.tenantId;
    response.userId = entity.userId;
    response.remark = entity.remark;
    return response;
  }
}

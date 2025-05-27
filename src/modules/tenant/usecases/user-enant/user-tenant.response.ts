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
    const response = new UserTenantResponse();
    response.id = entity?.id;
    response.organizationId = entity.organizationId;
    response.userId = entity.userId;
    response.remark = entity.remark;
    return response;
  }
}

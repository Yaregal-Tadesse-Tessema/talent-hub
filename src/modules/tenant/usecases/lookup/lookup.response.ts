/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { LookupEntity } from "../../persistencies/lookup.entity";
import { AccountStatusEnums } from "src/modules/auth/constants";
import { CommonResponses } from "src/libs/Common/common.responses";

export class LookupResponse extends CommonResponses {
    @ApiProperty({
      example: 'uuid',
    })
    @IsNotEmpty()
      id?: string;
      @ApiProperty()
      firstName?: string;
      @ApiProperty()
      middleName?: string;
      @ApiProperty()
      fullName?: string;
      @ApiProperty()
      lastName?: string;
      @ApiProperty()
      password: string;
      @ApiProperty()
      email: string;
      @ApiProperty()
      phoneNumber: string;
      @ApiProperty()
      status: AccountStatusEnums;
      currentUser?: any;

      @ApiProperty()
      jobTitle?: string;
      @ApiProperty()
      startDate?: Date;
      @ApiProperty()
      tenantId?: string;
      @ApiProperty()
      tenantName?: string;

     
    static toResponse(entity: LookupEntity): LookupResponse {
      const response = new LookupResponse();
      response.id = entity?.id;
      response.fullName = `${entity?.firstName} ${entity?.middleName} ${entity?.lastName}`;
      response.firstName = entity.firstName;
      response.middleName = entity.middleName;
      response.lastName = entity.lastName;
      response.email = entity.email;
      response.phoneNumber = entity.phoneNumber;
      response.status = entity?.status;
      
      response.createdBy = entity.createdBy;
      response.updatedBy = entity.updatedBy;
      response.deletedBy = entity.deletedBy;
      response.createdAt = entity.createdAt;
      response.updatedAt = entity.updatedAt;
      response.deletedAt = entity.deletedAt;
      return response;
    }
  }
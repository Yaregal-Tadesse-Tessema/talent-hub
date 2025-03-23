import {
    CollectionQuery,
    IncludeQuery,
  } from '@libs/collection-query/collection-query';
  import { ApiPaginatedResponse } from '@libs/response-format/api-paginated-response';
  import { DataResponseFormat } from '@libs/response-format/data-response-format';
  import {
    Controller,
    Get,
    Param,
    Query,
  } from '@nestjs/common';
  import {
    ApiExtraModels,
    ApiOkResponse,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';
  
  import { TenantResponse } from '../usecase/tenant/tenant.response';
import { EmployeeOrganizationQuery } from '../usecase/employees-Organization/employee-organization.usecase.query';
  
  @Controller('employee-organizations')
  @ApiTags('employee-organizations')
  @ApiResponse({ status: 500, description: 'Internal error' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiExtraModels(DataResponseFormat)
  export class EmployeeOrganizationController {
    constructor(
      private employeeOrganizationQuery: EmployeeOrganizationQuery ,
    ) {}
    @Get('get-employee-organizations/:id')
    @ApiOkResponse({ type: TenantResponse })
    async getEmployeeOrganization(@Param('id') id: string, @Query() query: IncludeQuery) {
      return await this.employeeOrganizationQuery.getEmployeeOrganization(id, query.includes);
    }
    @Get('get-employee-organizations')
    @ApiOkResponse({ type: ApiPaginatedResponse })
    async getEmployeeOrganizations(@Query() query: CollectionQuery) {
      return await this.employeeOrganizationQuery.getEmployeeOrganizations(query);
    }
  }
  
/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  FormStatusEnum,
} from '../constants';

export class FormResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  tenantId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ enum: FormStatusEnum })
  status: FormStatusEnum;

  @ApiProperty({ required: false, description: 'Form.io form design JSON' })
  design?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FormListResponse {
  @ApiProperty({ type: [FormResponse] })
  data: FormResponse[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

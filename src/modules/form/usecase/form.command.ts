/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
} from 'class-validator';
import {
  FormStatusEnum,
} from '../constants';

export class CreateFormCommand {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  tenantId?: string;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ enum: FormStatusEnum, default: FormStatusEnum.DRAFT, required: false })
  @IsOptional()
  @IsEnum(FormStatusEnum)
  status?: FormStatusEnum;

  @ApiProperty({ required: false, description: 'Form.io form design JSON' })
  @IsOptional()
  @IsObject()
  design?: any;
}

export class UpdateFormCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  @ApiProperty({ required: false })
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  tenantId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(FormStatusEnum)
  status?: FormStatusEnum;

  @ApiProperty({ required: false, description: 'Form.io form design JSON' })
  @IsOptional()
  @IsObject()
  design?: any;
}

export class FormFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ enum: FormStatusEnum, required: false })
  @IsOptional()
  @IsEnum(FormStatusEnum)
  status?: FormStatusEnum;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number;
}


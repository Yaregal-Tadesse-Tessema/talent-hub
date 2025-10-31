/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsUrl,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  OpportunityCategoryEnum,
  OpportunityLocationTypeEnum,
  OpportunityStatusEnum,
} from '../constants';

export class CreateOpportunityCommand {
  @ApiProperty({ enum: OpportunityCategoryEnum })
  @IsNotEmpty()
  @IsEnum(OpportunityCategoryEnum, {
    message: 'category must be a valid OpportunityCategoryEnum value',
  })
  category: OpportunityCategoryEnum;

  @ApiProperty({ example: 'Postdoctoral Fellowship in Renewable Energy Systems' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Title must be at least 10 characters' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @ApiProperty({ example: 'Addis Ababa University & African Research Council' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200, { message: 'Organizer must not exceed 200 characters' })
  organizer: string;

  @ApiProperty({
    example:
      'Fully funded postdoctoral research opportunity focused on renewable energy innovations in Africa. Login to explore full details and apply.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(400, { message: 'Summary must not exceed 400 characters (60 words)' })
  summary: string;

  @ApiProperty({
    example: 'Open to PhD holders in engineering or environmental sciences.',
    required: false,
  })
  @IsOptional()
  @IsString()
  eligibility?: string;

  @ApiProperty({
    example: 'Research proposal, academic CV, and two references.',
    required: false,
  })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiProperty({
    example: 'Monthly stipend, research funding, and access to advanced laboratories.',
    required: false,
  })
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiProperty({ example: '2026-02-28' })
  @IsNotEmpty()
  @IsDateString()
  deadline: string;

  @ApiProperty({ example: '2026-03-15', required: false })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiProperty({ example: 'https://aau.edu.et/postdoc2026' })
  @IsNotEmpty()
  @IsUrl({}, { message: 'officialLink must be a valid URL' })
  officialLink: string;

  @ApiProperty({ example: 'Addis Ababa, Ethiopia' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ enum: OpportunityLocationTypeEnum, default: OpportunityLocationTypeEnum.LOCAL })
  @IsOptional()
  @IsEnum(OpportunityLocationTypeEnum, {
    message: 'locationType must be a valid OpportunityLocationTypeEnum value',
  })
  locationType?: OpportunityLocationTypeEnum;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ enum: OpportunityStatusEnum, default: OpportunityStatusEnum.ACTIVE, required: false })
  @IsOptional()
  @IsEnum(OpportunityStatusEnum, {
    message: 'status must be a valid OpportunityStatusEnum value',
  })
  status?: OpportunityStatusEnum;
}

export class UpdateOpportunityCommand {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(OpportunityCategoryEnum)
  category?: OpportunityCategoryEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  organizer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  summary?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  eligibility?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  officialLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(OpportunityLocationTypeEnum)
  locationType?: OpportunityLocationTypeEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(OpportunityStatusEnum)
  status?: OpportunityStatusEnum;
}

export class OpportunityFilterDto {
  @ApiProperty({ enum: OpportunityCategoryEnum, required: false })
  @IsOptional()
  @IsEnum(OpportunityCategoryEnum)
  category?: OpportunityCategoryEnum;

  @ApiProperty({ enum: OpportunityLocationTypeEnum, required: false })
  @IsOptional()
  @IsEnum(OpportunityLocationTypeEnum)
  locationType?: OpportunityLocationTypeEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number;
}


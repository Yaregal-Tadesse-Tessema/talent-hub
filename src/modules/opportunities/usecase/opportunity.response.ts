/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  OpportunityCategoryEnum,
  OpportunityLocationTypeEnum,
  OpportunityStatusEnum,
} from '../constants';

export class OpportunityPublicResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: OpportunityCategoryEnum })
  category: OpportunityCategoryEnum;

  @ApiProperty()
  title: string;

  @ApiProperty()
  organizer: string;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  deadline: Date;

  @ApiProperty({ required: false })
  eventDate?: Date;

  @ApiProperty()
  location: string;

  @ApiProperty({ enum: OpportunityLocationTypeEnum })
  locationType: OpportunityLocationTypeEnum;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class OpportunityFullResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: OpportunityCategoryEnum })
  category: OpportunityCategoryEnum;

  @ApiProperty()
  title: string;

  @ApiProperty()
  organizer: string;

  @ApiProperty()
  summary: string;

  @ApiProperty({ required: false })
  eligibility?: string;

  @ApiProperty({ required: false })
  requirements?: string;

  @ApiProperty({ required: false })
  benefits?: string;

  @ApiProperty()
  deadline: Date;

  @ApiProperty({ required: false })
  eventDate?: Date;

  @ApiProperty()
  officialLink: string;

  @ApiProperty()
  location: string;

  @ApiProperty({ enum: OpportunityLocationTypeEnum })
  locationType: OpportunityLocationTypeEnum;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  viewCount: number;

  @ApiProperty({ enum: OpportunityStatusEnum })
  status: OpportunityStatusEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OpportunityListResponse {
  @ApiProperty({ type: [OpportunityPublicResponse] })
  data: OpportunityPublicResponse[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}


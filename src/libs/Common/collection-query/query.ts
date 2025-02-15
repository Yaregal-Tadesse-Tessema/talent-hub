import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { FilterOperators } from './filter_operators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CollectionQuery {
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  // horizontal filtering like selecting only certain columns
  select?: string[] = [];

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  // outer array  'and' inner array 'or'
  where?: Where[][] = [];

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  /** Sets maximal number of entities to take */
  take?: number;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  /** Sets number of entities to skip.  */
  skip?: number;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  orderBy?: Order[] = [];

  /**
   * this is foreign key relationship one to many, many to many or one to one
   * eg user has many roles, user has one profile, user has many permissions
   * and lets say we want to get all the roles, profile and permissions for a user
   * we can use includes to get all the related data
   * by using the foreign key relationship
   */

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  includes?: string[] = [];

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  groupBy?: string[] = [];

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  // outer array  'and' inner array 'or'
  having?: Where[][] = [];

  /**
   * if true: returns the total number of records that match the query not the data.
   */
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  count?: boolean;
}

export class Order {
  @ApiProperty()
  @IsString()
  column: string;

  @ApiProperty()
  @IsEnum(['ASC', 'DESC'], {
    message: 'Direction must be either ASC or DESC',
  })
  direction?: 'ASC' | 'DESC';
  @IsEnum(['NULLS FIRST', 'NULLS LAST'], {
    message: 'Null must be either FIRST or LAST',
  })
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
}

export class Where {
  @ApiProperty()
  @IsString()
  column: string;
  @ApiProperty()
  @IsString()
  value: any;
  @IsEnum(FilterOperators, {
    message: `Operator must be one of ${Object.keys(
      FilterOperators,
    ).toString()}`,
  })
  operator: string;
}

// https://postgrest.org/en/stable/references/api/tables_views.html#operators

export type FilterOperator =
  | '='
  | '>'
  | '>='
  | '<'
  | '<='
  | '<>'
  | '!='
  | 'LIKE'
  | 'ILIKE'
  | '~'
  | '~*'
  | 'IN'
  | 'IS'
  | 'IS DISTINCT FROM'
  | '@@'
  | 'contains'
  | '<@'
  | '&&'
  | '&<'
  | '&>'
  | '-|-'
  | 'NOT'
  | 'OR'
  | 'AND'
  | 'ALL'
  | 'ANY'
  | 'BETWEEN';

export interface CollectionResult<T> {
  total: number;
  items: T[];
}

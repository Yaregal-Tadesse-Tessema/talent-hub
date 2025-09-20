/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateAccountCommand {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}
export class UserLoginCommand {
  @ApiProperty()
  userName: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  @IsOptional()
  orgId?: string;
  @ApiProperty()
  @IsOptional()
  phoneNumber?: string;
  @ApiProperty()
  @IsOptional()
  email?: string;
}

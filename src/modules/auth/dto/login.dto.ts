/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
  @ApiProperty()
  code?: string;
}
export class LogoutDto {
  @ApiProperty()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ required: false })
  token: string;
}

export class LoginDto2 extends LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  expiresIn: string;
}

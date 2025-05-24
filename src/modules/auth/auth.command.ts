/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

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
  orgCode?: string;
  @ApiProperty()
  phoneNumber?: string;
  @ApiProperty()
  email?: string;
}

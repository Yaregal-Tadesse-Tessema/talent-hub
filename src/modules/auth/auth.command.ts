/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountCommand {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}

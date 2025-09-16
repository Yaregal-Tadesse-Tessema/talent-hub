import { PasswordResetEntity } from '../../persistances/password-reset/password-reset.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  date: Date;

  static toResponse(entity: PasswordResetEntity): PasswordResetResponse {
    const response = new PasswordResetResponse();
    response.id = entity.id;
    response.token = entity.token;
    response.userId = entity.userId;
    response.email = entity.email;
    response.status = entity.status;
    response.phoneNumber = entity.phoneNumber;
    response.date = entity.date;
    return response;
  }
}



import { SessionEntity } from '@auth/persistences/sessions/session.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SessionResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  accountId: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  refreshToken: string;
  @ApiProperty()
  token: string;
  @ApiProperty()
  ipAddress: string;
  @ApiProperty()
  userAgent?: string;
  @ApiProperty()
  createdBy?: string;
  @ApiProperty()
  updatedBy?: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  deletedAt?: Date;
  @ApiProperty()
  deletedBy?: string;
  static toResponse(sessionEntity: SessionEntity): SessionResponse {
    const sessionResponse = new SessionResponse();
    sessionResponse.id = sessionEntity.id;
    sessionResponse.accountId = sessionEntity.accountId;
    sessionResponse.refreshToken = sessionEntity.refreshToken;
    sessionResponse.token = sessionEntity.token;
    sessionResponse.ipAddress = sessionEntity.ipAddress;
    sessionResponse.userAgent = sessionEntity.userAgent;
    sessionResponse.createdBy = sessionEntity.createdBy;
    sessionResponse.updatedBy = sessionEntity.updatedBy;
    sessionResponse.deletedBy = sessionEntity.deletedBy;
    sessionResponse.createdAt = sessionEntity.createdAt;
    sessionResponse.updatedAt = sessionEntity.updatedAt;
    sessionResponse.deletedAt = sessionEntity.deletedAt;
    return sessionResponse;
  }
}

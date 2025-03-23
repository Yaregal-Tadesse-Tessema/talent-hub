import { ResetPasswordTokenEntity } from '@auth/persistences/reset-password/reset-password.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordTokenResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  token: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  accountId: string;
  @ApiProperty()
  createdBy: string;
  @ApiProperty()
  updatedBy: string;
  @ApiProperty()
  deletedBy: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  deletedAt: Date;
  static toResponse(
    entity: ResetPasswordTokenEntity,
  ): ResetPasswordTokenResponse {
    const resetPasswordTokenResponse = new ResetPasswordTokenResponse();
    resetPasswordTokenResponse.token = entity.token;
    resetPasswordTokenResponse.email = entity.email;
    resetPasswordTokenResponse.accountId = entity.accountId;
    resetPasswordTokenResponse.createdBy = entity.createdBy;
    resetPasswordTokenResponse.updatedBy = entity.updatedBy;
    resetPasswordTokenResponse.deletedBy = entity.deletedBy;
    resetPasswordTokenResponse.createdAt = entity.createdAt;
    resetPasswordTokenResponse.updatedAt = entity.updatedAt;
    resetPasswordTokenResponse.deletedAt = entity.deletedAt;
    return resetPasswordTokenResponse;
  }
}

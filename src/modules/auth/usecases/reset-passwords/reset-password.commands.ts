import { ResetPasswordTokenEntity } from '@auth/persistences/reset-password/reset-password.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateResetPasswordTokenCommand {
  token: string;
  email: string;
  accountId: string;
  static fromCommand(
    command: CreateResetPasswordTokenCommand,
  ): ResetPasswordTokenEntity {
    const resetPasswordDomain = new ResetPasswordTokenEntity();
    resetPasswordDomain.token = command.token;
    resetPasswordDomain.email = command.email;
    resetPasswordDomain.accountId = command.accountId;
    return resetPasswordDomain;
  }
}

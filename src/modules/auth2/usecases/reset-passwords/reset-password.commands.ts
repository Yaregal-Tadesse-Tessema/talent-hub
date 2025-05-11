/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ResetPasswordTokenEntity } from '../../persistences/reset-password/reset-password.entity';

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

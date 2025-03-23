import { Injectable } from '@nestjs/common';
import { CreateResetPasswordTokenCommand } from './reset-password.commands';
import { ResetPasswordTokenRepository } from '@auth/persistences/reset-password/reset-password.repository';
import { ResetPasswordTokenResponse } from './reset-password.response';
@Injectable()
export class ResetPasswordTokenCommands {
  constructor(
    private resetPasswordTokenRepository: ResetPasswordTokenRepository,
  ) {}
  async createResetPasswordToken(
    command: CreateResetPasswordTokenCommand,
  ): Promise<ResetPasswordTokenResponse> {
    const resetPasswordTokenDomain =
      CreateResetPasswordTokenCommand.fromCommand(command);
    const result = await this.resetPasswordTokenRepository.save(
      resetPasswordTokenDomain,
    );
    return ResetPasswordTokenResponse.toResponse(result);
  }
  async deleteResetPasswordToken(accountId: string): Promise<boolean> {
    return await this.resetPasswordTokenRepository.delete(accountId);
  }
}

/* eslint-disable prettier/prettier */
import { PasswordResetResponse } from './password-reset.response';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PasswordResetEntity } from '../../persistances/password-reset/password-reset.entity';
import { CreatePasswordResetCommand } from './password-reset.command';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class PasswordResetCommand {
  constructor(
    @InjectRepository(PasswordResetEntity)
    private readonly passwordResetRepository: Repository<PasswordResetEntity>,
  ) {}
  @OnEvent('create-password-reset')
  async createPasswordReset(command: CreatePasswordResetCommand): Promise<PasswordResetResponse> {
    const passwordResetDomain = CreatePasswordResetCommand.fromCommand(command);
    const passwordReset = await this.passwordResetRepository.save(passwordResetDomain);
    return PasswordResetResponse.toResponse(passwordReset);
  }
  async deletePasswordResetByEmail(email: string): Promise<void> {
    const passwordResetDomain = await this.passwordResetRepository.findOne({
      where: { email: email },
    });
    if (passwordResetDomain) {
      await this.passwordResetRepository.delete(passwordResetDomain.id);
    }
  }

}

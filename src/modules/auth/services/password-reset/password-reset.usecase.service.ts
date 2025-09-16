/* eslint-disable prettier/prettier */
import { PasswordResetResponse } from './password-reset.response';
import { BadRequestException, Injectable } from '@nestjs/common';
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
  ) { }
  @OnEvent('create-password-reset')
  async createPasswordReset(command: CreatePasswordResetCommand): Promise<PasswordResetResponse> {
    const passwordResetDomain = CreatePasswordResetCommand.fromCommand(command);
    const passwordReset = await this.passwordResetRepository.save(passwordResetDomain);
    return PasswordResetResponse.toResponse(passwordReset);
  }
  async updatePasswordReset(entity: PasswordResetResponse): Promise<PasswordResetResponse> {
    const passwordReset = await this.passwordResetRepository.save(entity);
    return PasswordResetResponse.toResponse(passwordReset);
  }
  async deletePasswordResetByEmailOrPhone(userName: string): Promise<boolean> {
    if (!userName) throw new BadRequestException('Either email or phone number is required');
    const passwordResetDomain = await this.passwordResetRepository.findOne({
      where: [
        { email: userName },
        { phoneNumber: userName }
      ]
    });
    if (passwordResetDomain) {
      const result = await this.passwordResetRepository.delete([{ id: passwordResetDomain.id }, { email: userName }, { phoneNumber: userName }]);
      if (result.affected > 0) {
        return true;
      }
      return false;
    }
    return false;
  }

}

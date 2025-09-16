/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PasswordResetResponse } from './password-reset.response';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetEntity } from '../../persistances/password-reset/password-reset.entity';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
@Injectable()
export class PasswordResetQuery {
    constructor(
        @InjectRepository(PasswordResetEntity)
        private readonly passwordResetRepository: Repository<PasswordResetEntity>,
    ) { }
    async getPasswordReset(id: string): Promise<PasswordResetResponse> {
        const passwordReset: PasswordResetEntity = await this.passwordResetRepository.findOne({ where: { id: id } })
        if (!passwordReset) {
            return null;
        }
        return PasswordResetResponse.toResponse(passwordReset);
    }
    async getPasswordResetByToken(
        token: string,
    ): Promise<PasswordResetResponse> {
        const passwordReset = await this.passwordResetRepository.findOne(
            {
                where: {
                    token: token,
                }
            },
        );
        if (!passwordReset) {
            return null;
        }
        return PasswordResetResponse.toResponse(passwordReset);
    }
    async getPasswordResets(
    ): Promise<DataResponseFormat<PasswordResetResponse>> {
        const passwordResets = await this.passwordResetRepository.find();
        const data = passwordResets.map((item) => PasswordResetResponse.toResponse(item));
        const d: DataResponseFormat<PasswordResetResponse> = {
            total: passwordResets.length,
            items: data,
        };
        return d;
    }
    async getPasswordResetByEmail(userName: string): Promise<PasswordResetResponse> {
        const passwordReset = await this.passwordResetRepository.findOne({
            where:[
                {
                    email: userName,
                },
                {
                    phoneNumber: userName,
                }
            ]
        });
        if (!passwordReset) {
            return null;
        }
        return PasswordResetResponse.toResponse(passwordReset);
    }
}

/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AfroMessageService {
  private readonly logger = new Logger(AfroMessageService.name);
  private readonly baseUrl = 'https://api.afromessage.com/api';
  private readonly sender = 'Muya.jobs';
  private readonly identifierId = process.env.AFRO_MESSAGE_IDENTIFIER_ID;
  private readonly apiKey = process.env.AFRO_MESSAGE_API_KEY;
  constructor(private readonly httpService: HttpService) {}

  async sendMessage(
    message: string,
    phoneNumber: string,
    callback = null,
  ): Promise<AxiosResponse<any>> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<any>(
          `${this.baseUrl}/send`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            params: {
              from: this.identifierId,
              sender: this.sender,
              to: phoneNumber,
              message,
              callback,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data;
  }
  async sendOtp(
    phoneNumber: string,
    callback = null,
  ): Promise<AxiosResponse<any>> {
    const codeLength = 6;
    const codeType = 0; // 0 for number only codes. 1 for alphabet only codes and 2 for alphanumeric codes.
    const timeToLive = 60 * 60; // in seconds
    const postMessage = ' is Your login verification code.';
    // const preMessage = 'Your login verification code is ';
    // const spacesBefore = 1;
    const spacesAfter = 2;
    // const response = await instance.get(`/challenge`, {
    //   params: {
    //     from: identifierId,
    //     sender: sender,
    //     to: phoneNumber,
    //     ps: postMessage,
    //     sa: spacesAfter,
    //     ttl: timeToLive,
    //     len: codeLength,
    //     t: codeType,
    //     callback: callback,
    //   },
    // });
    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(`${this.baseUrl}/challenge`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          params: {
            from: this.identifierId,
            // sender: this.sender,
            to: phoneNumber,
            ps: postMessage,
            sa: spacesAfter,
            ttl: timeToLive,
            len: codeLength,
            t: codeType,
            callback,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data;
  }
  async verifyOtp(
    phoneNumber: string,
    otpCode: string,
    verificationId: string,
  ): Promise<any> {
    return { phoneNumber, otpCode, verificationId };
  }
  async sendBulkMessage(
    message: string,
    phoneNumbers: string[],
    callback = null,
  ): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<any>(
          `${this.baseUrl}/send`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            params: {
              from: this.identifierId,
              sender: this.sender,
              to: phoneNumbers,
              message,
              callback,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data;
  }
}

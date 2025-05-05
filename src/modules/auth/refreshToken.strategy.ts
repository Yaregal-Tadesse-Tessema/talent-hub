/* eslint-disable prettier/prettier */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import * as process from 'node:process';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    const secret = process.env.REFRESH_TOKEN_SECRET_KEY;
    console.log(secret);
    if (!secret) {
      throw new Error('TOKEN_SECRET_KEY is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.REFRESH_TOKEN_SECRET_KEY,
      passReqToCallback: true,
    });
  }
  validate(req: Request, payload: any) {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    return { ...payload, refreshToken };
  }
}

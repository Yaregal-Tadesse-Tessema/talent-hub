/* eslint-disable prettier/prettier */
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
    console.log('TOKEN_SECRET_KEY:', process.env.TOKEN_SECRET_KEY);
    console.log('REFRESH_TOKEN_SECRET_KEY:', '');
    console.log('PUBLIC_DATABASE_Name:', process.env.PUBLIC_DATABASE_Name);
    console.log('APPLICATION_PORT:', process.env.APPLICATION_PORT);
    console.log(
      'PUBLIC_DATABASE_USERNAME:',
      process.env.PUBLIC_DATABASE_USERNAME,
    );
    console.log('EMAIL_USER:', process.env.EMAIL_USER);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        '06788ed74c52baf6ecff2876caa01619f03ca1b11b872ad1f182728d3694f227c22b35dc775ac634cd88e1c17fa80fface0cf30127b34dc8cfed063a240db46c',
      passReqToCallback: true,
    });
    console.log(secret);
    if (!secret) {
      throw new Error('REFRESH_TOKEN_SECRET_KEY is not defined');
    }

  }
  validate(req: Request, payload: any) {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    return { ...payload, refreshToken };
  }
}

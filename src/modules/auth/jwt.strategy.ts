/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import * as process from 'node:process';
Injectable();
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const strategyOptions: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        '669e081f0821d394b54b7dbad62a6e429df0fee54f905e9d1c7de1dab373a57cd4e4c871245b58ceb2a788451c9b95a3ffbbb803fb0818e566041fe10482b281',
    };

    super(strategyOptions);
  }

  async validate(payload: any) {
    const { exp, iat, iss, nbf, sub, ...rest } = payload;
    return rest;
  }
}

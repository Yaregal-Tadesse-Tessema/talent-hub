/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import * as process from 'node:process';
Injectable();
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const strategyOptions: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.TOKEN_SECRET_KEY,
    };

    super(strategyOptions);
  }

  async validate(payload: any) {
    const { exp, iat, iss, nbf, sub, ...rest } = payload;
    return rest;
  }
}

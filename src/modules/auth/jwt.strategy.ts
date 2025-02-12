/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

Injectable();
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const strategyOptions: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "sjj458a7r4w5AESJKLQHJADKWJMBN",
      // secretOrKey: process.env.TOKEN_SECRET,
    };

    super(strategyOptions);
  }

  async validate(payload: any) {
    const { exp, iat, iss, nbf, sub, ...rest } = payload;
    return rest;
  }
}

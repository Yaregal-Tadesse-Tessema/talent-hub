/* eslint-disable prettier/prettier */
import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
// import { AppConfigService } from '../../app-config/app-config.service';
import { ALLOW_ANONYMOUS_META_KEY } from './allow-anonymous.decorator';

export const userInfo: () => ParameterDecorator = createParamDecorator(
  (_data, req: ExecutionContext) => {
    const request = req.switchToHttp().getRequest();
    return request.user;
  },
);
@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    // private appConfig: AppConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isAnonymousAllowed =
      this.reflector?.get<boolean>(
        ALLOW_ANONYMOUS_META_KEY,
        context.getHandler(),
      ) ||
      this.reflector?.get<boolean>(
        ALLOW_ANONYMOUS_META_KEY,
        context.getClass(),
      );
    if (isAnonymousAllowed) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.TOKEN_SECRET_KEY,
      });
      request['user'] = payload;
    } catch (err) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user.accountType === 'user';
  }
}

@Injectable()
export class EmployeeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user.accountType === 'employee';
  }
}

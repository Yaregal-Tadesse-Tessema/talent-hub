import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ALLOW_ANONYMOUS_META_KEY } from './allow-anonymous.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
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

    return super.canActivate(context);
  }
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ) {
    if (!user) {
      throw err || new UnauthorizedException(info.message);
    }
    const request = context.switchToHttp().getRequest();
    // const headers = request.headers;

    if (err) {
      throw err || new UnauthorizedException(info.message);
    }
    request['user'] = user;
    return user;
  }
}

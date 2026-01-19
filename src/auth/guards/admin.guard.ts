import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedAccessException } from 'src/common/exceptions/auth.exceptions';

@Injectable()
export class JwtAdminGuard extends AuthGuard('jwt-admin') {

    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
      }
    
    handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) {
        throw new UnauthorizedAccessException('admin resources');
    }
        return user;
    }
}

import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { UnauthorizedAccessException } from "src/common/exceptions/auth.exceptions";

// Additional functions just for custom Error messages
@Injectable()
export class JwtDriverGuard extends AuthGuard('jwt-driver') {

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
       return super.canActivate(context); 
    }

    handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
        if (err || !user) {
          throw new UnauthorizedAccessException('Rider resources');
        }
        return user;
      }
}
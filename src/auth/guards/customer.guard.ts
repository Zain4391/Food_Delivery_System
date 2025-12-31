import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UnauthorizedAccessException } from "../../common/exceptions/auth.exceptions";


// Additional functions just for custom Error messages
@Injectable()
export class JwtCustomerGuard extends AuthGuard('jwt-customer') {
  
    // Automatically called to validate the token.
    canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedAccessException('customer resources');
    }
    return user;
  }
}
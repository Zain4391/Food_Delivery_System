import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtCustomerGuard extends AuthGuard('jwt-customer') {}
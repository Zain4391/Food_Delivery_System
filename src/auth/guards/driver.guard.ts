import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtDriverGuard extends AuthGuard('jwt-driver') {}
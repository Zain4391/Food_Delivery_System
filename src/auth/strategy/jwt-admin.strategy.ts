import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { jwtConstants } from "src/config/jwt.constants";
import { Customer } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import type { AuthenticatedUser, JwtPayload } from "../types/auth.types";
import { ROLES } from "src/common/enums/roles.enum";

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {

    constructor(
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.adminSecret,
        })
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {

        const admin = await this.customerRepository.findOne({
            where: { id: payload.sub }
        });

        if (!admin) {
            throw new UnauthorizedException();
        }

        if (admin.role !== ROLES.ADMIN) {
            throw new UnauthorizedException('Access denied. Admin role required.');
        }

        return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            userType: 'admin'
        }
    }
}

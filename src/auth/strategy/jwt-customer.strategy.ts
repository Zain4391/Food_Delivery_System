import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { jwtConstants } from "src/config/jwt.constants";
import { Customer } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import type { AuthenticatedUser, JwtPayload } from "../types/auth.types";


@Injectable()
export class JwtCustomerStrategy extends PassportStrategy(Strategy, 'jwt-customer') {

    constructor(
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.customerSecret,
        })
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {

        const customer = await this.customerRepository.findOne({
            where: { id: payload.sub }
        });

        if(!customer) {
            throw new UnauthorizedException();
        }

        return {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            role: customer.role,
            userType: 'customer'
        }
    }
}
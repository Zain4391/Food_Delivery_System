import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtPayload } from "@supabase/supabase-js";
import { ExtractJwt, Strategy } from "passport-jwt";
import { jwtConstants } from "src/config/jwt.constants";
import { DeliveryDriver } from "src/drivers/entities/driver.entity";
import { Repository } from "typeorm";
import { AuthenticatedUser } from "../types/auth.types";

@Injectable()
export class DriverStrategy extends PassportStrategy(Strategy, 'jwt-driver') {

    constructor(
        @InjectRepository(DeliveryDriver)
        private driverRepository: Repository<DeliveryDriver>
    ) {
        super({ 
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.driverSecret
        })
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        const driver = await this.driverRepository.findOne({
            where: { id: payload.sub }
        });

        if (!driver) {
            throw new UnauthorizedException();
        }

        return {
            id: driver.id,
            email: driver.email,
            name: driver.name,
            userType: 'driver'
        }
    }
}

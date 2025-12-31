import { ROLES } from "src/common/enums/roles.enum";

export interface JwtPayload {
    sub: string;
    email: string;
    name: string;
    role: ROLES;
    userType: 'customer' | 'driver'
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: ROLES;
    userType: 'customer' | 'driver';
}
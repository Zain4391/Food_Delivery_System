import { ROLES } from "src/common/enums/roles.enum";

export interface JwtPayload {
    sub: string;
    email: string;
    name: string;
    role: ROLES;
    userType: 'customer' | 'driver' | 'admin'
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: ROLES;
    userType: 'customer' | 'driver' | 'admin';
    profile_img_url?: string;
    // Driver-specific — only set when userType === 'driver'
    is_available?: boolean;
    vehicle_type?: string;
    phone?: string;
}

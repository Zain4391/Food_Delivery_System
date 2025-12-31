export interface JwtPayload {
    sub: string;
    email: string;
    name: string;
    userType: 'customer' | 'driver'
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    userType: 'customer' | 'driver';
}
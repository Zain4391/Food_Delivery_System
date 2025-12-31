export const jwtConstants = {
 customerSecret: process.env.JWT_CUSTOMER_SECRET || 'your-secret-key-change-this',
 driverSecret: process.env.JWT_DRIVER_SECRET || 'your-driver-secret-change-this',
 expiresIn: '7d' as const,
};
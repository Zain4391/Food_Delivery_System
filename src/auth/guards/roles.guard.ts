import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES } from "src/common/enums/roles.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Customer } from "src/users/entities/user.entity";

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requireRoles = this.reflector.getAllAndOverride<ROLES[]>(ROLES_KEY, [
            context.getHandler(), // method level decorator
            context.getClass(), // Class level decorator
        ]);

        if (!requireRoles) {
            return true;
        }

        const req: {user?: Customer} = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user) {
            throw new ForbiddenException("User not authenticated");
        }

        // check if the user has any ONE role
        const hasRole = requireRoles.some((role) => user.role === role);

        if (!hasRole) {
            throw new ForbiddenException(
                `Access denied. Required roles: ${requireRoles.join(', ')}. Your role: ${user.role}`
            );
        }

        return true;
    }
}
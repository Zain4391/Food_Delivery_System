import { SetMetadata } from "@nestjs/common";
import { ROLES } from "src/common/enums/roles.enum";

// Key to store and retrieve metadata
// Roles decorator which stores the roles
// Usage: @Roles(ROLES.ADMIn)
export const ROLES_KEY = 'roles'; 
export const Roles = (...roles: ROLES[]) => SetMetadata(ROLES_KEY, roles);
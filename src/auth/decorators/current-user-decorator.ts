import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Customer } from "../../users/entities/user.entity";

// Used to extract user from incoming request
// Useage: @CurrentUser() user: Customer
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): Customer => {
        const req: { user?: Customer } = ctx.switchToHttp().getRequest();
        return req.user as Customer;
    }
);
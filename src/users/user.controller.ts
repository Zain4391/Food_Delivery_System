import { Controller, Get, HttpStatus, UseGuards } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators/current-user-decorator";
import { JwtCustomerGuard } from "src/auth/guards/customer.guard";
import type { AuthenticatedUser } from "src/auth/types/auth.types";

@Controller("customer")
export class CustomerController {

    @Get("profile")
    @UseGuards(JwtCustomerGuard)
    getCustomerProfile(@CurrentUser() customer: AuthenticatedUser) {
        return {
            statusCode: HttpStatus.OK,
            message: "Customer Profile retrieved successfully",
            customer
        };
    }
}
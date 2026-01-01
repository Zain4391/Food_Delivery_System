import { Controller, Get, HttpStatus, UseGuards } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators/current-user-decorator";
import { JwtDriverGuard } from "src/auth/guards/driver.guard";
import type { AuthenticatedUser } from "src/auth/types/auth.types";

@Controller("driver")
export class DriverController {

    @Get("profile")
    @UseGuards(JwtDriverGuard)
    getDriverProfile( @CurrentUser() driver: AuthenticatedUser) {
        return {
            statusCode: HttpStatus.OK,
            message: "Driver Profile retrieved successfully",
            driver
        };
    }
}
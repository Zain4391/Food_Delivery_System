import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors, Delete, Patch } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators/current-user-decorator";
import { JwtDriverGuard } from "src/auth/guards/driver.guard";
import type { AuthenticatedUser } from "src/auth/types/auth.types";
import { DriverService } from "./driver.service";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { ROLES } from "src/common/enums/roles.enum";
import { DriverPaginationDTO } from "./dtos/driver-pagination.dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UuidValidationPipe } from "src/common/pipes/uuid-validation-pipe";
import { UpdateDriverDTO } from "./dtos/update-driver-dto";
import { ForgotPasswordDTO } from "./dtos/forgot-password.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdatePasswordDTO } from "./dtos/update-password.dto";
import { OrderPaginationDTO } from "src/orders/dto/order-pagination.dto";
import { VEHICLE_TYPE } from "./entities/driver.entity";

@Controller("driver")
export class DriverController {

    constructor (
        private readonly driverService: DriverService
    ) {}

    @Get("profile")
    @UseGuards(JwtDriverGuard)
    getDriverProfile( @CurrentUser() driver: AuthenticatedUser) {
        return {
            statusCode: HttpStatus.OK,
            message: "Driver Profile retrieved successfully",
            driver
        };
    }

    @Get("all")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findAllDrivers(@Query() query: DriverPaginationDTO) {
        return await this.driverService.findAll(query);
    }

    @Get(":id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findOneById(@Param("id", UuidValidationPipe) id: string) {
        return await this.driverService.findById(id);
    }

    @Get(":email")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findByEmail(@Param("email") email: string) {
        return await this.driverService.findByEmail(email);
    }

    @Get("/orders/delivered/:id")
    @UseGuards(RolesGuard, JwtDriverGuard)
    @Roles(ROLES.ADMIN, ROLES.DRIVER)
    async findDeliveredOrders(@Param("id", UuidValidationPipe) id: string, @Query() query: OrderPaginationDTO) {
        return await this.driverService.findDeliveredOrders(id, query);
    }

    @Get("/orders/pending/:id")
    @UseGuards(RolesGuard, JwtDriverGuard)
    @Roles(ROLES.ADMIN, ROLES.DRIVER)
    async findPendingOrders(@Param("id", UuidValidationPipe) id: string, @Query() query: OrderPaginationDTO) {
        return await this.driverService.findPendingOrders(id, query);
    }

    @Get("/orders/all/:id")
    @UseGuards(RolesGuard, JwtDriverGuard)
    @Roles(ROLES.ADMIN, ROLES.DRIVER)
    async findAllDriverOrders(@Param("id", UuidValidationPipe) id: string, @Query() query: OrderPaginationDTO) {
        return await this.driverService.findAllDriverOrders(id, query);
    }

    @Put("/update/:id")
    @UseGuards(JwtDriverGuard)
    @Roles(ROLES.DRIVER)
    async updateDriver(@Param('id', UuidValidationPipe) id: string, @Body() updateDto: UpdateDriverDTO) {
        const driver = await this.driverService.update(updateDto, id);
        return {
            statusCode: HttpStatus.OK,
            message: "Driver updated successfully",
            driver
        }
    }

    @Post("/forgot-password")
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
        const message = await this.driverService.forgotPassword(forgotPasswordDto);
        return {
            statusCode: HttpStatus.OK,
            message
        }
    }

    @Put("/update-password/:id")
    @UseGuards(JwtDriverGuard)
    @Roles(ROLES.DRIVER)
    async updatePassword(@Param("id", UuidValidationPipe) id: string, @Body() updateDto: UpdatePasswordDTO) {
        const message = await this.driverService.updatePassword(updateDto, id);
        return {
            statusCode: HttpStatus.OK,
            message
        }
    }

    @Post("/upload-profile-image/:id")
    @UseGuards(JwtDriverGuard)
    @Roles(ROLES.DRIVER)
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfileImage(
        @Param('id', UuidValidationPipe) id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        const driver = await this.driverService.uploadProfileImage(id, file);
        return {
            statusCode: HttpStatus.OK,
            message: "Profile image uploaded successfully",
            driver
        }
    }

    @Patch("/change-vehicle/:id")
    @UseGuards(JwtDriverGuard)
    @Roles(ROLES.DRIVER)
    async changeVehicle(
        @Param('id', UuidValidationPipe) id: string,
        @Body('vehicle_type') vehicleType: VEHICLE_TYPE
    ) {
        const driver = await this.driverService.changeVehicle(id, vehicleType);
        return {
            statusCode: HttpStatus.OK,
            message: "Vehicle type updated successfully",
            driver
        }
    }

    @Patch("/toggle-availability/:id")
    @UseGuards(JwtDriverGuard)
    @Roles(ROLES.DRIVER)
    async toggleAvailability(@Param('id', UuidValidationPipe) id: string) {
        const driver = await this.driverService.toggleAvailability(id);
        return {
            statusCode: HttpStatus.OK,
            message: `Driver is now ${driver.is_available ? 'available' : 'unavailable'}`,
            driver
        }
    }

    @Delete("/delete/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async deleteDriver(@Param("id", UuidValidationPipe) id: string) {
        const message = await this.driverService.remove(id);
        return {
            statusCode: HttpStatus.OK,
            message
        };
    }
}
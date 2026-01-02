import { Body, Controller, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors, Delete, Patch, HttpStatus } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators/current-user-decorator";
import { ApiSuccessResponse } from "src/auth/dto/api-response-dto";
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
        return new ApiSuccessResponse(driver, "Driver Profile retrieved successfully", HttpStatus.OK);
    }

    @Get("all")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findAllDrivers(@Query() query: DriverPaginationDTO) {
        return new ApiSuccessResponse(await this.driverService.findAll(query), "Drivers found Successfully", HttpStatus.OK);
    }

    @Get(":id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findOneById(@Param("id", UuidValidationPipe) id: string) {
        return new ApiSuccessResponse(await this.driverService.findById(id), "Driver found successfully", HttpStatus.OK);
    }

    @Get(":email")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findByEmail(@Param("email") email: string) {
        return new ApiSuccessResponse(await this.driverService.findByEmail(email), "Driver with email found", HttpStatus.OK);
    }

    @Get("/orders/delivered/:id")
    @UseGuards(RolesGuard, JwtDriverGuard)
    @Roles(ROLES.ADMIN, ROLES.DRIVER)
    async findDeliveredOrders(@Param("id", UuidValidationPipe) id: string, @Query() query: OrderPaginationDTO) {
        return new ApiSuccessResponse(await this.driverService.findDeliveredOrders(id, query), `Delivered Orders for driver ${id} found`, HttpStatus.OK);
    }

    @Get("/orders/pending/:id")
    @UseGuards(RolesGuard, JwtDriverGuard)
    @Roles(ROLES.ADMIN, ROLES.DRIVER)
    async findPendingOrders(@Param("id", UuidValidationPipe) id: string, @Query() query: OrderPaginationDTO) {
        return new ApiSuccessResponse(await this.driverService.findPendingOrders(id, query), `Pending orders for driver ${id} found`, HttpStatus.OK);
    }

    @Get("/orders/all/:id")
    @UseGuards(RolesGuard, JwtDriverGuard)
    @Roles(ROLES.ADMIN, ROLES.DRIVER)
    async findAllDriverOrders(@Param("id", UuidValidationPipe) id: string, @Query() query: OrderPaginationDTO) {
        return new ApiSuccessResponse(await this.driverService.findAllDriverOrders(id, query), `All orders for driver ${id} found`, HttpStatus.OK);
    }

    @Put("/update/:id")
    @UseGuards(JwtDriverGuard)
    @Roles(ROLES.DRIVER)
    async updateDriver(@Param('id', UuidValidationPipe) id: string, @Body() updateDto: UpdateDriverDTO) {
        const driver = await this.driverService.update(updateDto, id);
        return new ApiSuccessResponse(driver, "Driver updated successfully", HttpStatus.OK);
    }

    @Post("/forgot-password")
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
        const message = await this.driverService.forgotPassword(forgotPasswordDto);
        return new ApiSuccessResponse([], message, HttpStatus.OK);
    }

    @Put("/update-password/:id")
    @UseGuards(JwtDriverGuard)
    @Roles(ROLES.DRIVER)
    async updatePassword(@Param("id", UuidValidationPipe) id: string, @Body() updateDto: UpdatePasswordDTO) {
        const message = await this.driverService.updatePassword(updateDto, id);
        return new ApiSuccessResponse([], message, HttpStatus.OK);
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
        return new ApiSuccessResponse(driver, "Profile image uploaded successfully", HttpStatus.OK);
    }

    @Patch("/change-vehicle/:id")
    @UseGuards(JwtDriverGuard)
    @Roles(ROLES.DRIVER)
    async changeVehicle(
        @Param('id', UuidValidationPipe) id: string,
        @Body('vehicle_type') vehicleType: VEHICLE_TYPE
    ) {
        const driver = await this.driverService.changeVehicle(id, vehicleType);
        return new ApiSuccessResponse(driver, "Vehicle type updated successfully", HttpStatus.OK);
    }

    @Patch("/toggle-availability/:id")
    @UseGuards(JwtDriverGuard)
    @Roles(ROLES.DRIVER)
    async toggleAvailability(@Param('id', UuidValidationPipe) id: string) {
        const driver = await this.driverService.toggleAvailability(id);
        return new ApiSuccessResponse(driver, `Driver is now ${driver.is_available ? 'available' : 'unavailable'}`, HttpStatus.OK);
    }

    @Delete("/delete/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async deleteDriver(@Param("id", UuidValidationPipe) id: string) {
        const message = await this.driverService.remove(id);
        return new ApiSuccessResponse(null, message, HttpStatus.NO_CONTENT);
    }
}
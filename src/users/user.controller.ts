import { Controller, Get, Param, Put, UseGuards, Body, Query, Post, UploadedFile, UseInterceptors, Delete, HttpStatus } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "src/auth/decorators/current-user-decorator";
import { ApiSuccessResponse } from "src/auth/dto/api-response-dto";
import { JwtCustomerGuard } from "src/auth/guards/customer.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import type { AuthenticatedUser } from "src/auth/types/auth.types";
import { ROLES } from "src/common/enums/roles.enum";
import { CustomerPaginationDTO } from "./dtos/customer-pagination.dto";
import { CustomerService } from "./user.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UuidValidationPipe } from "src/common/pipes/uuid-validation-pipe";
import { OrderPaginationDTO } from "src/orders/dto/order-pagination.dto";
import { UpdateCustomerDTO } from "./dtos/update-customer.dto";
import { ForgotPasswordDTO } from "./dtos/forgot-password.dto";
import { UpdatePasswordDTO } from "./dtos/update-password.dto";

@Controller("customer")
export class CustomerController {

    constructor (
        private readonly customerService: CustomerService
    ) {}

    @Get("profile")
    @UseGuards(JwtCustomerGuard)
    getCustomerProfile(@CurrentUser() customer: AuthenticatedUser) {
        return new ApiSuccessResponse(customer, "Customer Profile retrieved successfully", HttpStatus.OK);
    }

    @Get("all")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findAllCustomers(@Query() query: CustomerPaginationDTO) {
        return new ApiSuccessResponse(await this.customerService.findAll(query), "Restaurant created successfully", HttpStatus.OK);
    }

    @Get(":id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findOneById(@Param('id', UuidValidationPipe) id: string) {
        return new ApiSuccessResponse(await this.customerService.findById(id), "User found successfully", HttpStatus.OK);
    }

    @Get(":email")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findByEmail(@Param('email') email: string) {
        return new ApiSuccessResponse(await this.customerService.findByEmail(email), "User found by email successfully", HttpStatus.OK);
    }

    @Get("/orders/:id")
    @UseGuards(RolesGuard, JwtCustomerGuard)
    @Roles(ROLES.ADMIN, ROLES.CUSTOMER)
    async findUserOrders(@Param("id", UuidValidationPipe) id: string, @Query() query: OrderPaginationDTO) {
        return new ApiSuccessResponse(await this.customerService.findUserOrders(id, query), "User orders retrieved successfully", HttpStatus.OK);
    }

    @Put("/update/:id")
    @UseGuards(JwtCustomerGuard)
    @Roles(ROLES.CUSTOMER)
    async updateUser(@Param("id", UuidValidationPipe) id: string, @Body() updateDto: UpdateCustomerDTO) {
        return new ApiSuccessResponse(await this.customerService.update(updateDto, id), "User updated successfully", HttpStatus.OK);
    }

    @Put("/update-password/:id")
    @UseGuards(JwtCustomerGuard)
    @Roles(ROLES.CUSTOMER)
    async updatePassword(@Param("id", UuidValidationPipe) id: string, @Body() updateDto: UpdatePasswordDTO) {
        const message = await this.customerService.updatePassword(updateDto, id);
        return new ApiSuccessResponse([], message, HttpStatus.OK);
    }

    @Post("/forgot-password")
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
        const message = await this.customerService.forgotPassword(forgotPasswordDto);
        return new ApiSuccessResponse([], message, HttpStatus.OK);
    }

    @Post("/upload-profile-image/:id")
    @UseGuards(JwtCustomerGuard)
    @Roles(ROLES.CUSTOMER)
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfileImage(
        @Param("id", UuidValidationPipe) id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        const customer = await this.customerService.uploadProfileImage(id, file);
        return new ApiSuccessResponse(customer, "Profile image uploaded successfully", HttpStatus.OK);
    }

    @Delete("/delete/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async deleteCustomer(@Param("id", UuidValidationPipe) id: string) {
        const message = await this.customerService.remove(id);
        return new ApiSuccessResponse(null, message, HttpStatus.NO_CONTENT);
    }
}
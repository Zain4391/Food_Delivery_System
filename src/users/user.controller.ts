import { Controller, Get, HttpStatus, Param, Put, UseGuards, Body, Query, Post, UploadedFile, UseInterceptors, Delete } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "src/auth/decorators/current-user-decorator";
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
        return {
            statusCode: HttpStatus.OK,
            message: "Customer Profile retrieved successfully",
            customer
        };
    }

    @Get("all")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findAllCustomers(@Query() query: CustomerPaginationDTO) {
        return await this.customerService.findAll(query);
    }

    @Get(":id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findOneById(@Param('id', UuidValidationPipe) id: string) {
        return await this.customerService.findById(id);
    }

    @Get(":email")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findByEmail(@Param('email') email: string) {
        return await this.customerService.findByEmail(email);
    }

    @Get("/orders/:id")
    @UseGuards(RolesGuard, JwtCustomerGuard)
    @Roles(ROLES.ADMIN, ROLES.CUSTOMER)
    async findUserOrders(@Param("id", UuidValidationPipe) id: string, @Query() query: OrderPaginationDTO) {
        return await this.customerService.findUserOrders(id, query);
    }

    @Put("/update/:id")
    @UseGuards(JwtCustomerGuard)
    @Roles(ROLES.CUSTOMER)
    async updateUser(@Param("id", UuidValidationPipe) id: string, @Body() updateDto: UpdateCustomerDTO) {
        return await this.customerService.update(updateDto, id);
    }

    @Put("/update-password/:id")
    @UseGuards(JwtCustomerGuard)
    @Roles(ROLES.CUSTOMER)
    async updatePassword(@Param("id", UuidValidationPipe) id: string, @Body() updateDto: UpdatePasswordDTO) {
        const message = await this.customerService.updatePassword(updateDto, id);
        return {
            statusCode: HttpStatus.OK,
            message
        };
    }

    @Post("/forgot-password")
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
        const message = await this.customerService.forgotPassword(forgotPasswordDto);
        return {
            statusCode: HttpStatus.OK,
            message
        };
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
        return {
            statusCode: HttpStatus.OK,
            message: "Profile image uploaded successfully",
            customer
        };
    }

    @Delete("/delete/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async deleteCustomer(@Param("id", UuidValidationPipe) id: string) {
        const message = await this.customerService.remove(id);
        return {
            statusCode: HttpStatus.OK,
            message
        };
    }
}
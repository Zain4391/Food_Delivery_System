import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiSuccessResponse } from "src/auth/dto/api-response-dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtDriverGuard } from "src/auth/guards/driver.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { ROLES } from "src/common/enums/roles.enum";
import { UuidValidationPipe } from "src/common/pipes/uuid-validation-pipe";
import { DeliveryService } from "./delivery.service";
import { CreateDeliveryDTO } from "./dtos/create-delivery.dto";
import { DeliveryPaginationDTO } from "./dtos/delivery-pagination.dto";
import { UpdateDeliveryDTO } from "./dtos/update-delivery.dto";

@Controller("delivery")
export class DeliveryController {

    constructor (
        private readonly deliveryService: DeliveryService
    ) {} 

    @Get("all")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findAllDeliveries(@Query() query: DeliveryPaginationDTO) {
        return new ApiSuccessResponse(await this.deliveryService.findAll(query), "All deliveries found", HttpStatus.OK);
    }

    @Get(":id")
    @UseGuards(RolesGuard, JwtDriverGuard)
    @Roles(ROLES.ADMIN, ROLES.DRIVER)
    async findDeliveryById(@Param("id", UuidValidationPipe) id: string) {
        return new ApiSuccessResponse(await this.deliveryService.findById(id), "Delivery found", HttpStatus.OK);
    }

    @Get("order/:orderId")
    @UseGuards(RolesGuard, JwtDriverGuard)
    @Roles(ROLES.ADMIN, ROLES.DRIVER)
    async findDeliveryByOrderId(@Param("orderId", UuidValidationPipe) orderId: string) {
        return new ApiSuccessResponse(await this.deliveryService.findByOrderId(orderId), `Delivries by driver ${orderId} found`, HttpStatus.OK);
    }

    @Post("create")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async createDelivery(@Body() createDto: CreateDeliveryDTO) {
        const delivery = await this.deliveryService.create(createDto);
        return new ApiSuccessResponse(delivery, "Delivery created successfully", HttpStatus.CREATED);
    }

    @Put("update/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async updateDelivery(
        @Param("id", UuidValidationPipe) id: string,
        @Body() updateDto: UpdateDeliveryDTO
    ) {
        const delivery = await this.deliveryService.update(id, updateDto);
        return new ApiSuccessResponse(delivery, "Delivery updated successfully", HttpStatus.OK);
    }

    @Patch("mark-picked-up/:id")
    @UseGuards(JwtDriverGuard)
    @Roles(ROLES.DRIVER)
    async markAsPickedUp(@Param("id", UuidValidationPipe) id: string) {
        const delivery = await this.deliveryService.markAsPickedUp(id);
        return new ApiSuccessResponse(delivery, "Delivery marked as picked up", HttpStatus.OK);
    }

    @Patch("mark-delivered/:id")
    @UseGuards(JwtDriverGuard)
    @Roles(ROLES.DRIVER)
    async markAsDelivered(@Param("id", UuidValidationPipe) id: string) {
        const delivery = await this.deliveryService.markAsDelivered(id);
        return new ApiSuccessResponse(delivery, "Delivery marked as delivered", HttpStatus.OK);
    }

    @Delete("delete/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async removeDelivery(@Param("id", UuidValidationPipe) id: string) {
        const message = await this.deliveryService.remove(id);
        return new ApiSuccessResponse(null, message, HttpStatus.OK);
    }
}
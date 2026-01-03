import { Body, Controller, Delete, Get, HttpStatus, Logger, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { CurrentUser } from "src/auth/decorators/current-user-decorator";
import { ApiSuccessResponse } from "src/auth/dto/api-response-dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtCustomerGuard } from "src/auth/guards/customer.guard";
import { JwtDriverGuard } from "src/auth/guards/driver.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import type { AuthenticatedUser } from "src/auth/types/auth.types";
import { ROLES } from "src/common/enums/roles.enum";
import { UuidValidationPipe } from "src/common/pipes/uuid-validation-pipe";
import { CreateOrderDTO } from "./dto/create-order.dto";
import { OrderPaginationDTO } from "./dto/order-pagination.dto";
import { UpdateOrderDTO } from "./dto/update-order.dto";
import { OrderStatus } from "./entities/order.entity";
import { OrderService } from "./order.service";
import { OrderConfirmedEvent } from "src/events/restaurant/order-confirmed.event";
import { DriverAssignedEvent } from "src/events/delivery/driver-assigned.event";
import { OrderDeliveredEvent } from "src/events/delivery/order-delivered.event";



@Controller("order")
export class OrderController {

    private readonly logger = new Logger(OrderController.name);

    constructor(
        private readonly orderService: OrderService
    ) {}

    @Get("all")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findAllOrders(@Query() query: OrderPaginationDTO) {
        return new ApiSuccessResponse(await this.orderService.findAll(query), "Orders found successfully", HttpStatus.OK);
    }

    @Get(":id")
    @UseGuards(RolesGuard, JwtCustomerGuard)
    @Roles(ROLES.ADMIN, ROLES.CUSTOMER)
    async findOrderById(@Param("id", UuidValidationPipe) id: string) {
        return new ApiSuccessResponse(await this.orderService.findById(id), `Order with ID ${id} found`, HttpStatus.OK);
    }

    @Post("create")
    @UseGuards(JwtCustomerGuard)
    @Roles(ROLES.CUSTOMER)
    async createOrder(@Body() createDto: CreateOrderDTO, @CurrentUser() user: AuthenticatedUser) {
        const order = await this.orderService.create(createDto, user.id);
        return new ApiSuccessResponse(order, "Order created successfully", HttpStatus.CREATED);
    }

    @Put("update/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async updateOrder(
        @Param("id", UuidValidationPipe) id: string,
        @Body() updateDto: UpdateOrderDTO
    ) {
        const order = await this.orderService.update(id, updateDto);
        return new ApiSuccessResponse(order, "Order updated successfully", HttpStatus.OK);
    }

    @Patch("update-status/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async updateOrderStatus(
        @Param("id", UuidValidationPipe) id: string,
        @Body('status') status: OrderStatus
    ) {
        const order = await this.orderService.updateStatus(id, status);
        return new ApiSuccessResponse(order, `Order status updated to ${status}`, HttpStatus.OK);
    }

    @Patch("assign-driver/:orderId")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async assignDriver(
        @Param("orderId", UuidValidationPipe) orderId: string,
        @Body('driver_id') driverId: string
    ) {
        const order = await this.orderService.assignDriver(orderId, driverId);
        return new ApiSuccessResponse(order, "Driver assigned successfully", HttpStatus.OK);
    }

    @Patch("cancel/:id")
    @UseGuards(JwtCustomerGuard)
    @Roles(ROLES.CUSTOMER)
    async cancelOrder(@Param("id", UuidValidationPipe) id: string) {
        const order = await this.orderService.cancelOrder(id);
        return new ApiSuccessResponse(order, "Order cancelled successfully", HttpStatus.OK);
    }

    @Delete("delete/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async removeOrder(@Param("id", UuidValidationPipe) id: string) {
        const message = await this.orderService.remove(id);
        return new ApiSuccessResponse([], message, HttpStatus.NO_CONTENT);
    }

    @Get("customer/:customerId")
    @UseGuards(RolesGuard, JwtCustomerGuard)
    @Roles(ROLES.ADMIN, ROLES.CUSTOMER)
    async findOrdersByCustomer(
        @Param("customerId", UuidValidationPipe) customerId: string,
        @Query() query: OrderPaginationDTO
    ) {
        return new ApiSuccessResponse(await this.orderService.findByCustomer(customerId, query), `Orders for user: ${customerId} found`, HttpStatus.OK);
    }

    @Get("restaurant/:restaurantId")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async findOrdersByRestaurant(
        @Param("restaurantId", UuidValidationPipe) restaurantId: string,
        @Query() query: OrderPaginationDTO
    ) {
        return new ApiSuccessResponse(await this.orderService.findByRestaurant(restaurantId, query), `Orders for restaurant ${restaurantId} found`, HttpStatus.OK);
    }

    @Get("driver/:driverId")
    @UseGuards(RolesGuard, JwtDriverGuard)
    @Roles(ROLES.ADMIN, ROLES.DRIVER)
    async findOrdersByDriver(
        @Param("driverId", UuidValidationPipe) driverId: string,
        @Query() query: OrderPaginationDTO
    ) {
        return new ApiSuccessResponse(await this.orderService.findByDriver(driverId, query), `Orders for driver ${driverId} found`, HttpStatus.OK);
    }

    // ========== Event Handlers ==========

    @EventPattern('order.confirmed')
    async handleOrderConfirmed(@Payload() data: OrderConfirmedEvent) {
        this.logger.log(`Received order.confirmed event:`, data);
        await this.orderService.handleOrderConfirmed(data);
    }

    @EventPattern('driver.assigned')
    async handleDriverAssigned(@Payload() data: DriverAssignedEvent) {
        this.logger.log(`Received driver.assigned event:`, data);
        await this.orderService.handleDriverAssigned(data);
    }

    @EventPattern('order.delivered')
    async handleOrderDelivered(@Payload() data: OrderDeliveredEvent) {
        this.logger.log(`Received order.delivered event:`, data);
        await this.orderService.handleOrderDelivered(data.orderId);
    }
}
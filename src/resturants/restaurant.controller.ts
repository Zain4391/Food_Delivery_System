import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiSuccessResponse } from "src/auth/dto/api-response-dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { ROLES } from "src/common/enums/roles.enum";
import { UuidValidationPipe } from "src/common/pipes/uuid-validation-pipe";
import { CreateMenuItemDTO } from "./dto/create-menu-item.dto";
import { CreateRestaurantDTO } from "./dto/create-restaurant.dto";
import { MenuItemPaginationDTO } from "./dto/menu-item-pagination.dto";
import { RestaurantPaginationDTO } from "./dto/restaurant-pagination.dto";
import { UpdateMenuItemDTO } from "./dto/update-menu-item.dto";
import { UpdateRestaurantDTO } from "./dto/update-restaurant.dto";
import { RestaurantService } from "./restaurant.service";

@Controller("restaurant")
export class RestaurantController {

    constructor(
        private readonly restaurantService: RestaurantService
    ) {}

    // ========== Restaurant Endpoints ==========

    @Get("all")
    async findAllRestaurants(@Query() query: RestaurantPaginationDTO) {
        return await this.restaurantService.findAllRestaurants(query);
    }

    @Get(":id")
    async findRestaurantById(@Param("id", UuidValidationPipe) id: string) {
        return await this.restaurantService.findRestaurantById(id);
    }

    @Post("create")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async createRestaurant(@Body() createDto: CreateRestaurantDTO) {
        const restaurant = await this.restaurantService.createRestaurant(createDto);
        return new ApiSuccessResponse(restaurant, "Restaurant created successfully");
    }

    @Put("update/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async updateRestaurant(
        @Param("id", UuidValidationPipe) id: string,
        @Body() updateDto: UpdateRestaurantDTO
    ) {
        const restaurant = await this.restaurantService.updateRestaurant(id, updateDto);
        return new ApiSuccessResponse(restaurant, "Restaurant updated successfully");
    }

    @Delete("delete/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async removeRestaurant(@Param("id", UuidValidationPipe) id: string) {
        const message = await this.restaurantService.removeRestaurant(id);
        return new ApiSuccessResponse(null, message);
    }

    @Patch("toggle-active/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async toggleRestaurantActive(@Param("id", UuidValidationPipe) id: string) {
        const restaurant = await this.restaurantService.toggleRestaurantActive(id);
        return new ApiSuccessResponse(restaurant, `Restaurant is now ${restaurant.is_active ? 'active' : 'inactive'}`);
    }

    @Post("upload-logo/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    async uploadRestaurantLogo(
        @Param("id", UuidValidationPipe) id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        const restaurant = await this.restaurantService.uploadRestaurantImage(id, file, 'logo');
        return new ApiSuccessResponse(restaurant, "Restaurant logo uploaded successfully");
    }

    @Post("upload-banner/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    async uploadRestaurantBanner(
        @Param("id", UuidValidationPipe) id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        const restaurant = await this.restaurantService.uploadRestaurantImage(id, file, 'banner');
        return new ApiSuccessResponse(restaurant, "Restaurant banner uploaded successfully");
    }

    // ========== Menu Item Endpoints ==========

    @Get(":restaurantId/menu/all")
    async findAllMenuItems(
        @Param("restaurantId", UuidValidationPipe) restaurantId: string,
        @Query() query: MenuItemPaginationDTO
    ) {
        return await this.restaurantService.findAll(restaurantId, query);
    }

    @Get(":restaurantId/menu/available")
    async findAvailableMenuItems(
        @Param("restaurantId", UuidValidationPipe) restaurantId: string,
        @Query() query: MenuItemPaginationDTO
    ) {
        return await this.restaurantService.findAvailableItems(restaurantId, query);
    }

    @Get("menu/item/:id")
    async findMenuItemById(@Param("id", UuidValidationPipe) id: string) {
        return await this.restaurantService.findById(id);
    }

    @Post(":restaurantId/menu/create")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async createMenuItem(
        @Param("restaurantId", UuidValidationPipe) restaurantId: string,
        @Body() createDto: CreateMenuItemDTO
    ) {
        const menuItem = await this.restaurantService.create(restaurantId, createDto);
        return new ApiSuccessResponse(menuItem, "Menu item created successfully");
    }

    @Put("menu/update/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async updateMenuItem(
        @Param("id", UuidValidationPipe) id: string,
        @Body() updateDto: UpdateMenuItemDTO
    ) {
        const menuItem = await this.restaurantService.update(id, updateDto);
        return new ApiSuccessResponse(menuItem, "Menu item updated successfully");
    }

    @Delete("menu/delete/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async removeMenuItem(@Param("id", UuidValidationPipe) id: string) {
        const message = await this.restaurantService.remove(id);
        return new ApiSuccessResponse(null, message);
    }

    @Patch("menu/toggle-availability/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    async toggleMenuItemAvailability(@Param("id", UuidValidationPipe) id: string) {
        const menuItem = await this.restaurantService.toggleAvailability(id);
        return new ApiSuccessResponse(menuItem, `Menu item is now ${menuItem.is_available ? 'available' : 'unavailable'}`);
    }

    @Post("menu/upload-image/:id")
    @UseGuards(RolesGuard)
    @Roles(ROLES.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    async uploadMenuItemImage(
        @Param("id", UuidValidationPipe) id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        const menuItem = await this.restaurantService.uploadMenuItemImage(id, file);
        return new ApiSuccessResponse(menuItem, "Menu item image uploaded successfully");
    }
}
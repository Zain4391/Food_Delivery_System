import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { MenuItem } from "src/resturants/entities/menu-item.entity";
import { Restaurant } from "src/resturants/entities/restaurant.entity";
import { Customer } from "src/users/entities/user.entity";
import { DeliveryDriver } from "src/drivers/entities/driver.entity";
import { OrderService } from "./order.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem, MenuItem, Restaurant, Customer, DeliveryDriver])
    ],
    providers: [OrderService],
    controllers: [],
    exports: [OrderService]
})
export class OrdersModule {}
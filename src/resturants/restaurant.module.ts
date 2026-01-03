import { Module } from "@nestjs/common";
import { RestaurantService } from "./restaurant.service";
import { RestaurantController } from "./restaurant.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MenuItem } from "./entities/menu-item.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { Order } from "src/orders/entities/order.entity";
import { RabbitMQModule } from "src/rabbitmq/rabbitmq.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([MenuItem, Restaurant, Order]),
        RabbitMQModule
    ],
    providers: [RestaurantService],
    controllers: [RestaurantController],
    exports: [RestaurantService]
})
export class RestaurantModule {}
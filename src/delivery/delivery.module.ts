import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Delivery } from "./entities/delivery.entity";
import { Order } from "src/orders/entities/order.entity";
import { DeliveryDriver } from "src/drivers/entities/driver.entity";
import { OrdersModule } from "src/orders/orders.module";
import { DeliveryService } from "./delivery.service";
import { DeliveryController } from "./delivery.controller";
import { RabbitMQModule } from "src/rabbitmq/rabbitmq.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Delivery, Order, DeliveryDriver]),
        OrdersModule,
        RabbitMQModule
    ],
    controllers: [DeliveryController],
    providers: [DeliveryService],
    exports: [DeliveryService]
})
export class DeliveryModule {}
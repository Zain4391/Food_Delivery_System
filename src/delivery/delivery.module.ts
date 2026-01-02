import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Delivery } from "./entities/delivery.entity";
import { Order } from "src/orders/entities/order.entity";
import { OrdersModule } from "src/orders/orders.module";
import { DeliveryService } from "./delivery.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Delivery, Order]),
        OrdersModule
    ],
    controllers: [],
    providers: [DeliveryService],
    exports: [DeliveryService]
})
export class DeliveryModule {}
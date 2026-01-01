import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeliveryDriver } from "./entities/driver.entity";
import { DriverService } from "./driver.service";
import { OrdersModule } from "src/orders/orders.module";
import { DriverController } from "./driver.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([DeliveryDriver]),
        OrdersModule
    ],
    providers: [DriverService],
    controllers: [DriverController],
    exports: [DriverService]
})
export class DriverModule {}
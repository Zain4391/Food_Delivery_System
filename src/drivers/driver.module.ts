import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeliveryDriver } from "./entities/driver.entity";
import { DriverService } from "./driver.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([DeliveryDriver])
    ],
    providers: [DriverService],
    controllers: [],
    exports: [DriverService]
})
export class DriverModule {}
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "./entities/user.entity";
import { CustomerService } from "./user.service";
import { OrdersModule } from "src/orders/orders.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Customer]),
        OrdersModule
        // ADD RabbitMQ
    ],
    providers: [CustomerService], // Nest's equivalent of Bean 
    controllers: [],
    exports: [CustomerService] // ervices which others can inject
})
export class CustomersModule {}
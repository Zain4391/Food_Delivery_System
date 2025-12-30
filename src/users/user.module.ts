import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "./entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Customer]),
        // ADD RabbitMQ
    ],
    providers: [], // Nest's equivalent of Bean 
    controllers: [],
    exports: [] // ervices which others can inject
})
export class CustomersModule {}
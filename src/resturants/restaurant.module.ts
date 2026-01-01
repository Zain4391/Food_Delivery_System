import { Module } from "@nestjs/common";
import { RestaurantService } from "./restaurant.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MenuItem } from "./entities/menu-item.entity";
import { Restaurant } from "./entities/restaurant.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([MenuItem, Restaurant])
    ],
    providers: [RestaurantService],
    controllers: [],
    exports: [RestaurantService]
})
export class RestaurantModule {}
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../users/entities/user.entity';
import { DeliveryDriver } from '../drivers/entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, DeliveryDriver])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

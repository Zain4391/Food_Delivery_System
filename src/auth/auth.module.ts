import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../users/entities/user.entity';
import { DeliveryDriver } from '../drivers/entities/driver.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtCustomerStrategy } from './strategy/jwt-customer.strategy';
import { DriverStrategy } from './strategy/jwt-driver.strategy';
import { JwtCustomerGuard } from './guards/customer.guard';
import { JwtDriverGuard } from './guards/driver.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, DeliveryDriver]),
    PassportModule,
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtCustomerStrategy, DriverStrategy, JwtCustomerGuard, JwtDriverGuard],
  exports: [AuthService, JwtCustomerGuard, JwtDriverGuard]
})
export class AuthModule {}

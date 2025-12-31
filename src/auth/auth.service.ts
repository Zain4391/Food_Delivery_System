import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { DeliveryDriver } from "src/drivers/entities/driver.entity";
import * as bcrypt from "bcrypt";
import { Customer } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { RegisterCustomerDTO } from "./dto/register-customer-dto";
import { CustomerResponseDTO } from "./dto/customer-response-dto";
import { CustomerAlreadyExistsException, CustomerNotFoundException } from "src/common/exceptions/customer.exceptions";
import { RegisterDriverDTO } from "./dto/register-driver-dto";
import { DriverResponseDTO } from "./dto/driver-response-dto";
import { DriverAlreadyExistsException, DriverNotFoundException } from "src/common/exceptions/driver.exceptions";
import { LoginDTO } from "./dto/login=dto";
import { AuthResponseDTO } from "./dto/auth-response-dto";
import type { JwtPayload } from "./types/auth.types";
import { jwtConstants } from "src/config/jwt.constants";


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(DeliveryDriver)
    private driverRepository: Repository<DeliveryDriver>,
    private jwtService: JwtService
  ) {}

  async registerCustomer(registerDto: RegisterCustomerDTO): Promise<CustomerResponseDTO> {

    const existingCustomer = await this.customerRepository.findOne({
      where: { email: registerDto.email}
    });

    if (existingCustomer) {
      throw new CustomerAlreadyExistsException(registerDto.email);
    }

    const hashedPassword = (await bcrypt.hash(registerDto.password, 10)) as string;
    const customer = this.customerRepository.create({
      ...registerDto,
      password: hashedPassword
    });

    const savedCustomer = await this.customerRepository.save(customer);
    return new CustomerResponseDTO(savedCustomer);
  }

  async registerDriver(registerDto: RegisterDriverDTO): Promise<DriverResponseDTO> {

    const existingDriver = await this.driverRepository.findOne({
      where: { email: registerDto.email }
    });

    if( existingDriver ) {
      throw new DriverAlreadyExistsException(registerDto.email);
    }

    const hashedPassword = (await bcrypt.hash(registerDto.password, 10)) as string;
    const driver = this.driverRepository.create({
      ...registerDto,
      password: hashedPassword
    });

    const savedDriver = await this.driverRepository.save(driver);
    return new DriverResponseDTO(savedDriver);
  }

  async customerLogin(loginDto: LoginDTO): Promise<AuthResponseDTO> {
    const customer = await this.customerRepository.findOne({
      where: { email: loginDto.email }
    });

    if (!customer) {
      throw new CustomerNotFoundException(loginDto.email);
    }

    const isValid = (await bcrypt.compare(loginDto.password, customer.password)) as boolean;

    if (!isValid) {
      throw new UnauthorizedException("Invalid customer credentials");
    }

    // construct jwt payload
    const payload: JwtPayload = {
      sub: customer.id,
      email: customer.email,
      name: customer.name,
      userType: 'customer'
    };

    // generate and sign the token
    const access_token = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.customerSecret,
      expiresIn: jwtConstants.expiresIn
    });

    return new AuthResponseDTO({
      access_token: access_token,
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.name
      }
    });
    
  }

  async riderLogin(loginDto: LoginDTO): Promise<AuthResponseDTO> {

    const driver = await this.driverRepository.findOne({
      where: { email: loginDto.email }
    });

    if (!driver) {
      throw new DriverNotFoundException(loginDto.email);
    }

    const isValid = (await bcrypt.compare(loginDto.password, driver.password)) as boolean;

    if (!isValid) {
      throw new UnauthorizedException("Invalid driver credentials");
    }

    const payload: JwtPayload = {
      sub: driver.id,
      email: driver.email,
      name: driver.name,
      userType: 'driver'
    };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.driverSecret,
      expiresIn: jwtConstants.expiresIn
    });

    return new AuthResponseDTO({
      access_token: access_token,
      user: {
        id: driver.id,
        email: driver.email,
        name: driver.name
      }
    });
  }
}
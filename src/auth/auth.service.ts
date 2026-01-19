import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { DeliveryDriver } from "src/drivers/entities/driver.entity";
import * as bcrypt from "bcrypt";
import { Customer } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { RegisterCustomerDTO } from "./dto/register-customer-dto";
import { CustomerResponseDTO } from "./dto/customer-response-dto";
import { AdminAlreadyExistsException, AdminNotFoundException, CustomerAlreadyExistsException, CustomerNotFoundException } from "src/common/exceptions/customer.exceptions";
import { RegisterDriverDTO } from "./dto/register-driver-dto";
import { DriverResponseDTO } from "./dto/driver-response-dto";
import { DriverAlreadyExistsException, DriverNotFoundException } from "src/common/exceptions/driver.exceptions";
import { LoginDTO } from "./dto/login=dto";
import type { JwtPayload } from "./types/auth.types";
import { jwtConstants } from "src/config/jwt.constants";
import { ROLES } from "src/common/enums/roles.enum";
import { RegisterAdminDTO } from "./dto/register-admin-dto";
import { AdminResponseDTO } from "./dto/admin-response-dto";
import { AuthResponseDTO } from "./dto/auth-response-dto";


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

    const role: ROLES = registerDto.role || ROLES.CUSTOMER;

    const hashedPassword = (await bcrypt.hash(registerDto.password, 10));
    const customer = this.customerRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: role,
      created_at: new Date()
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


    const hashedPassword = (await bcrypt.hash(registerDto.password, 10));
    const driver = this.driverRepository.create({
      ...registerDto,
      password: hashedPassword,
      created_at: new Date()
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

    const isValid = (await bcrypt.compare(loginDto.password, customer.password));

    if (!isValid) {
      throw new UnauthorizedException("Invalid customer credentials");
    }

    // construct jwt payload
    const payload: JwtPayload = {
      sub: customer.id,
      email: customer.email,
      name: customer.name,
      role: customer.role,
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

    const isValid = (await bcrypt.compare(loginDto.password, driver.password));

    if (!isValid) {
      throw new UnauthorizedException("Invalid driver credentials");
    }

    const payload: JwtPayload = {
      sub: driver.id,
      email: driver.email,
      name: driver.name,
      role: driver.role,
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

  async registerAdmin(registerDto: RegisterAdminDTO): Promise<AdminResponseDTO> {

    const existingAdmin = await this.customerRepository.findOne({
      where: {
        email: registerDto.email
      }
    });

    if(existingAdmin) {
      throw new AdminAlreadyExistsException(existingAdmin.email);
    }

    const role: ROLES = ROLES.ADMIN;

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const admin = this.customerRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: role,
      created_at: new Date()
    });

    const savedAdmin = await this.customerRepository.save(admin);
    return new AdminResponseDTO(savedAdmin);

  }

  async loginAdmin(loginDto: LoginDTO): Promise<AuthResponseDTO> {

    const admin = await this.customerRepository.findOne({
      where: {
        email: loginDto.email
      }
    });

    if(!admin) {
      throw new AdminNotFoundException(loginDto.email);
    }

    const isValid = (await bcrypt.compare(loginDto.password, admin.password));

    if (!isValid) {
      throw new UnauthorizedException("Invalid customer credentials");
    }

    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      userType: 'admin'
    };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.adminSecret,
      expiresIn: jwtConstants.expiresIn
    });

    return new AuthResponseDTO({
      access_token: access_token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  }
}

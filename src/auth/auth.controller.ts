import { Body, ClassSerializerInterceptor, Controller, HttpCode, HttpStatus, Post, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterCustomerDTO } from "./dto/register-customer-dto";
import { CustomerResponseDTO } from "./dto/customer-response-dto";
import { RegisterDriverDTO } from "./dto/register-driver-dto";
import { DriverResponseDTO } from "./dto/driver-response-dto";
import { LoginDTO } from "./dto/login=dto";
import { AuthResponseDTO } from "./dto/auth-response-dto";


@Controller("api/auth")
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post('customer/register')
  async registerCustomer(@Body() registerDto: RegisterCustomerDTO): Promise<CustomerResponseDTO> {
    return this.authService.registerCustomer(registerDto);
  }

  @Post('driver/register')
  async registerDriver(@Body() registerDto: RegisterDriverDTO): Promise<DriverResponseDTO> {
    return this.authService.registerDriver(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('customer/login')
  async loginCustomer(@Body() loginDto: LoginDTO): Promise<AuthResponseDTO> {
    return this.authService.customerLogin(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('driver/login')
  async loginDriver(@Body() loginDto: LoginDTO): Promise<AuthResponseDTO> {
    return this.authService.riderLogin(loginDto);
  }
}
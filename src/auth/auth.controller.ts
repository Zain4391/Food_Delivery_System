import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Post, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterCustomerDTO } from "./dto/register-customer-dto";
import { RegisterDriverDTO } from "./dto/register-driver-dto";
import { LoginDTO } from "./dto/login=dto";
import { ApiSuccessResponse } from "./dto/api-response-dto";


@Controller("api/auth")
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('customer/register')
  async registerCustomer(@Body() registerDto: RegisterCustomerDTO) {
    const customer = await this.authService.registerCustomer(registerDto);
    return new ApiSuccessResponse(customer, "Customer registered successfully", HttpStatus.CREATED);
  }

  @Post('driver/register')
  async registerDriver(@Body() registerDto: RegisterDriverDTO) {
    const driver = await this.authService.registerDriver(registerDto);
    return new ApiSuccessResponse(driver, "Driver registered successfully", HttpStatus.CREATED);
  }

  @Post('customer/login')
  async loginCustomer(@Body() loginDto: LoginDTO) {
    const authResponse = await this.authService.customerLogin(loginDto);
    return new ApiSuccessResponse(authResponse, "Customer logged in successfully", HttpStatus.OK);
  }

  @Post('driver/login')
  async loginDriver(@Body() loginDto: LoginDTO) {
    const authResponse = await this.authService.riderLogin(loginDto);
    return new ApiSuccessResponse(authResponse, "Driver logged in successfully", HttpStatus.OK);
  }
}
import { Body, Controller, Post } from '@nestjs/common';
import { AuthLoginInputDto } from './input-dto/auth-login.input-dto';
import { AuthRegistrationInputDto } from './input-dto/auth-registration.input-dto';

@Controller('auth')
export class AuthController {

  @Post()
  async registration(@Body() body: AuthRegistrationInputDto) {

  }

  @Post('login')
  async login(@Body() body: AuthLoginInputDto): Promise<void> {}
}

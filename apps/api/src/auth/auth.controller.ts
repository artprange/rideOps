import { Body, Controller, Inject, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly auth: AuthService,
  ) {}

  @Post('register')
  register(@Body() input: RegisterDto) {
    return this.auth.register(input);
  }
}

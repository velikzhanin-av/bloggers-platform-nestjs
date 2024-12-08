import { Body, Controller, Post, Req, Res, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthLoginInputDto } from './input-dto/auth-login.input-dto';
import { AuthRegistrationInputDto } from './input-dto/auth-registration.input-dto';
import { AuthService } from '../application/auth.service';
import { Response, Request } from 'express';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Post()
  async registration(@Body() body: AuthRegistrationInputDto) {
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: AuthLoginInputDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const dto = {
      loginOrEmail: body.loginOrEmail,
      password: body.password,
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || '',
    };
    // TODO поправить тип
    const result = await this.authService.login(dto);
    res.json({ accessToken: result.accessToken });
  }

  @Get('/me')
  async getUserInfo() {

  }
}

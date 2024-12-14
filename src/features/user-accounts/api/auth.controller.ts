import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthLoginInputDto } from './input-dto/auth-login.input-dto';
import { AuthService } from '../application/auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { UserContext } from '../../../core/dto/user-context';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { UserMeViewDto } from './output-dto/users.view-dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthConfirmationCodeDto } from './input-dto/auth-confirmation-code.dto';
import { AuthRegistrationEmailResendingDtp } from './input-dto/auth-registration-email-resending.dtp';

@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserDto) {
    return this.authService.registerUser(body);
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
  @UseGuards(JwtAuthGuard)
  async getUserInfo(
    @ExtractUserFromRequest() user: UserContext,
  ): Promise<UserMeViewDto> {
    return this.authQueryRepository.getUserInfo(user.userId);
  }

  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: AuthConfirmationCodeDto) {
    return this.authService.registrationConfirmation(body);
  }

  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() body: AuthRegistrationEmailResendingDtp,
  ) {
    return this.authService.registrationEmailResending(body);
  }
}

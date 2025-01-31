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
  Logger,
} from '@nestjs/common';
import { AuthLoginInputDto } from './input-dto/auth-login.input-dto';
import { Response, Request } from 'express';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { UserContext } from '../../../core/dto/user-context';
import { UserMeViewDto } from './output-dto/users.view-dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthConfirmationCodeDto } from './input-dto/auth-confirmation-code.dto';
import { AuthRegistrationEmailResendingDto } from './input-dto/auth-registration-email-resending.dtp';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/use-cases/register-user.use-case';
import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import { RegistrationConfirmationCommand } from '../application/use-cases/registration-confirmation.use-case';
import { RegistrationEmailResendingCommand } from '../application/use-cases/registration-email-resending.use-case';
import { BearerAuthGuard } from '../../../core/guards/custom/bearer-auth.guard';
import { CreateNewTokensCommand } from '../application/use-cases/create-new-tokens.use-case';
import { RefreshTokenAuthGuard } from '../../../core/guards/custom/refresh-token-auth.guard';
import { LogoutCommand } from '../application/use-cases/logout.use-case';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthQueryRepository } from '../infrastructure/postgresql/auth.query-repository';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authQueryRepository: AuthQueryRepository,
    private readonly commandBus: CommandBus,
    // private readonly logger = new Logger(AuthController.name),
  ) {}

  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserDto) {
    return this.commandBus.execute(new RegisterUserCommand(body));
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
    const result = await this.commandBus.execute(new LoginUserCommand(dto));
    res
      .cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: result.accessToken });
  }

  @SkipThrottle()
  @Get('/me')
  @UseGuards(BearerAuthGuard)
  async getUserInfo(
    @ExtractUserFromRequest() user: UserContext,
  ): Promise<UserMeViewDto> {
    return this.authQueryRepository.getUserInfo(user.userId);
  }

  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: AuthConfirmationCodeDto) {
    return this.commandBus.execute(new RegistrationConfirmationCommand(body));
  }

  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() body: AuthRegistrationEmailResendingDto,
  ) {
    return this.commandBus.execute(new RegistrationEmailResendingCommand(body));
  }

  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenAuthGuard)
  async refreshToken(
    @Res() res: Response,
    @ExtractUserFromRequest() user: UserContext,
  ): Promise<void> {
    const dto = { user };

    const result: {
      accessToken: string;
      refreshToken: string;
      tokenData: { iat: Date; exp: Date; deviceId: string };
    } = await this.commandBus.execute(new CreateNewTokensCommand(dto));
    res
      .cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: result.accessToken });
  }

  @SkipThrottle()
  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenAuthGuard)
  async logout(@ExtractUserFromRequest() user: UserContext) {
    return this.commandBus.execute(new LogoutCommand(user));
  }
}

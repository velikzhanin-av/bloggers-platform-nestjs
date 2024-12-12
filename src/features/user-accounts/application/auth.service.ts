import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDocument } from '../domain/users.entity';
import { AuthLoginDto } from '../dto/auth-login.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from './bcrypt.service';
import { randomUUID } from 'crypto';
import { JwtService } from './jwt.service';
import { AuthRepository } from '../infrastructure/auth.repository';
import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../domain/sessions.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from './users.service';
import { AuthConfirmationCodeDto } from '../api/input-dto/auth-confirmation-code.dto';
import { AuthRegistrationEmailResendingDtp } from '../api/input-dto/auth-registration-email-resending.dtp';
import { NotificationsService } from '../../notifications/application/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
    private bcryptService: BcryptService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private authRepository: AuthRepository,
    private notificationsService: NotificationsService,
  ) {}

  async login(dto: AuthLoginDto): Promise<{
    sessionId: string;
    accessToken: string;
    deviceId: string;
    refreshToken: string;
  }> {
    const user: UserDocument | null =
      await this.usersRepository.findByLoginOrEmail(dto.loginOrEmail);
    if (!user)
      throw new UnauthorizedException('login/email or password is wrong');

    if (
      !(await this.bcryptService.checkPassword(dto.password, user.passwordHash))
    )
      throw new UnauthorizedException('login/email or password is wrong');

    const userId: string = user._id.toString();
    const deviceId: string = randomUUID();

    const tokens: {
      accessToken: string;
      refreshToken: string;
      tokenData: { iat: Date; exp: Date; deviceId: string };
    } | null = await this.createAccessAndRefreshTokens(userId, deviceId);
    if (!tokens)
      throw new ForbiddenException('login/email or password is wrong');
    const iat: Date = tokens.tokenData.iat;
    const exp: Date = tokens.tokenData.exp;
    const resultAccessToken: number = await this.usersRepository.addJwtToken(
      userId,
      tokens.accessToken,
    );
    const resultRefreshToken: number =
      await this.usersRepository.addRefreshToken(userId, tokens.refreshToken);
    if (!resultAccessToken || !resultRefreshToken)
      throw new InternalServerErrorException('internal server error');

    const session: SessionDocument = this.SessionModel.createInstance({
      userId,
      deviceId,
      iat,
      exp,
      ip: dto.ip,
      deviceName: dto.userAgent,
    });
    await session.save();

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: session._id.toString(),
      deviceId,
    };
  }

  async createAccessAndRefreshTokens(userId: string, deviceId: string) {
    const accessToken: string = await this.jwtService.createJwt(
      userId,
      deviceId,
    );
    const refreshToken: string = await this.jwtService.createRefreshToken(
      userId,
      deviceId,
    );

    const tokenData: {
      iat: Date;
      exp: Date;
      deviceId: string;
    } | null = await this.jwtService.getDataFromJwtToken(refreshToken);

    if (!tokenData) return null;
    return { accessToken, refreshToken, tokenData };
  }

  async registerUser(dto: CreateUserDto): Promise<void> {
    await this.usersRepository.doesExistByLoginOrEmail(dto.login, dto.email);

    const userId: string = await this.usersService.createUser(dto);
    const confirmationCode = randomUUID();

    const user: UserDocument | null =
      await this.usersRepository.findOrNotFoundFail(userId);
    user!.setConfirmationCode(confirmationCode);
    await this.usersRepository.save(user!);

    await this.notificationsService.sendEmail(
      dto.login,
      dto.email,
      confirmationCode,
    );
  }

  async registrationConfirmation(dto: AuthConfirmationCodeDto): Promise<void> {
    const user: UserDocument =
      await this.usersRepository.findUserByConfirmationCode(dto.code);
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'code',
          },
        ],
      });
    }

    user.confirmEmail();
    await this.usersRepository.save(user);
    return;
  }

  async registrationEmailResending(
    dto: AuthRegistrationEmailResendingDtp,
  ): Promise<void> {
    const user: UserDocument = await this.usersRepository.findUserByEmail(
      dto.email,
    );
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'email',
          },
        ],
      });
    }

    const newConfirmationCode = randomUUID();
    user.setConfirmationCode(newConfirmationCode);
    await this.usersRepository.save(user);

    await this.notificationsService.sendEmail(
      user.login,
      user.email,
      newConfirmationCode,
    );
  }
}

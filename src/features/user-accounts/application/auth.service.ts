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
import { AuthConfirmationCodeDto } from '../api/input-dto/auth-confirmation-code.dto';
import { AuthRegistrationEmailResendingDtp } from '../api/input-dto/auth-registration-email-resending.dtp';
import { NotificationsService } from '../../notifications/application/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private authRepository: AuthRepository,
    private notificationsService: NotificationsService,
  ) {}

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

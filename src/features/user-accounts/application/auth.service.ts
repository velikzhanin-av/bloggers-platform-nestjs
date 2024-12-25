import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from './bcrypt.service';
import { CustomJwtService } from './jwt.service';
import { AuthRepository } from '../infrastructure/auth.repository';
import { Session, SessionModelType } from '../domain/sessions.entity';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationsService } from '../../notifications/application/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
    private bcryptService: BcryptService,
    private customJwtService: CustomJwtService,
    private usersRepository: UsersRepository,
    private authRepository: AuthRepository,
    private notificationsService: NotificationsService,
  ) {}

  async createAccessAndRefreshTokens(userId: string, deviceId: string) {
    const accessToken: string = await this.customJwtService.createJwt(
      userId,
      deviceId,
    );
    const refreshToken: string = await this.customJwtService.createRefreshToken(
      userId,
      deviceId,
    );

    const tokenData: {
      iat: Date;
      exp: Date;
      deviceId: string;
    } | null = await this.customJwtService.getDataFromJwtToken(refreshToken);

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
        errorsMessages: {
          message: 'string',
          field: 'code',
        },
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
        errorsMessages: {
          message: 'string',
          field: 'email',
        },
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

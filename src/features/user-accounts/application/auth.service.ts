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
}

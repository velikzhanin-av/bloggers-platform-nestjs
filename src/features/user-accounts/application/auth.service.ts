import {
  Injectable,
} from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from './bcrypt.service';
import { JwtService } from './jwt.service';
import { AuthRepository } from '../infrastructure/auth.repository';
import {
  Session,
  SessionModelType,
} from '../domain/sessions.entity';
import { InjectModel } from '@nestjs/mongoose';
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

}

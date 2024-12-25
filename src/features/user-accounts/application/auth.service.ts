import { Injectable } from '@nestjs/common';
import { CustomJwtService } from './jwt.service';
import { Session } from '../domain/sessions.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Session.name)
    private customJwtService: CustomJwtService,
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

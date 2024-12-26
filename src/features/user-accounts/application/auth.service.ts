import {Inject, Injectable} from '@nestjs/common';
import { CustomJwtService } from './jwt.service';
import { Session } from '../domain/sessions.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN
} from "../constants/auth-tokens.inject-constants";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private customJwtService: CustomJwtService,
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshTokenContext: JwtService,
  ) {}

  async createAccessAndRefreshTokens(userId: string, deviceId: string) {

    const accessToken = this.accessTokenContext.sign({ userId, deviceId });
    const refreshToken = this.refreshTokenContext.sign({ userId, deviceId });

    const tokenData: {
      iat: Date;
      exp: Date;
      deviceId: string;
    } | null = await this.customJwtService.getDataFromJwtToken(refreshToken);

    if (!tokenData) return null;
    return { accessToken, refreshToken, tokenData };
  }


}

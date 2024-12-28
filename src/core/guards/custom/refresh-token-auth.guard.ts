import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from "../../../features/user-accounts/constants/auth-tokens.inject-constants";

@Injectable()
export class RefreshTokenAuthGuard implements CanActivate {
  constructor(
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshTokenContext: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Извлекаем request
    const request = context.switchToHttp().getRequest();

    // Извлекаем refreshToken из cookie
    const token: string | null = this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    try {
      // Декодируем и валидируем токен, добавляем данные пользователя в request
      request.user = this.refreshTokenContext.verify(token);
      return true; // Если токен валиден, доступ разрешен
    } catch (error) {
      // В случае ошибки (например, невалидный токен)
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // Метод для извлечения токена из cookie
  private extractTokenFromCookie(request: any): string | null {
    const cookies = request.cookies;
    if (!cookies || !cookies.refreshToken) {
      return null;
    }
    return cookies.refreshToken;
  }
}

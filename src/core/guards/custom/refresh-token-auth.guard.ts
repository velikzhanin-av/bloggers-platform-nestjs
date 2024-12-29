import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from '../../../features/user-accounts/constants/auth-tokens.inject-constants';
import { SessionDocument } from '../../../features/user-accounts/domain/sessions.entity';
import { AuthRepository } from '../../../features/user-accounts/infrastructure/auth.repository';
import { UserContext } from '../../dto/user-context';

@Injectable()
export class RefreshTokenAuthGuard implements CanActivate {
  constructor(
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshTokenContext: JwtService,
    private readonly authRepository: AuthRepository,
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
      const user: UserContext = this.refreshTokenContext.verify(token);
      const session: SessionDocument | null =
        await this.authRepository.findSessionByIat(user.iat);
      if (!session) throw new UnauthorizedException('Session not found');
      request.user = user;
      return true; // Если токен валиден, доступ разрешен
    } catch (e) {
      // В случае ошибки (например, невалидный токен)
      console.log(e);
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

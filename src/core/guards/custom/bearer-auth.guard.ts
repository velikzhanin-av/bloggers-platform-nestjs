import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../../features/user-accounts/constants/auth-tokens.inject-constants';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly accessTokenContext: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Извлекаем request
    const request = context.switchToHttp().getRequest();

    // Извлекаем токен из заголовков
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Invalid or expired token');

    try {
      // Декодируем и валидируем токен Добавляем данные пользователя в request
      request.user = this.accessTokenContext.verify(token);
      return true; // Если токен валиден, доступ разрешен
    } catch (error) {
      // В случае ошибки (невалидный токен)
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Метод для извлечения токена из заголовков
  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }
}

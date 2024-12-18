import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      return true; // Пропускаем запросы без токена
    }

    try {
      const user = this.jwtService.verify(token); // Проверяем токен
      request.user = user; // Добавляем данные пользователя в request
    } catch {
      console.log(token);
      request.user = null; // Если токен недействителен, устанавливаем null
    }

    return true; // Пропускаем запросы
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }
}

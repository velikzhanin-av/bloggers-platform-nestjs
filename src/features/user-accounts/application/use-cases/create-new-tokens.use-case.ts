import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthUpdateSessionDto } from '../../dto/auth-refresh-token.dto';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthCommandRepository } from '../../infrastructure/postgresql/auth.command-repository';

export class CreateNewTokensCommand {
  constructor(public readonly dto: AuthUpdateSessionDto) {}
}

@CommandHandler(CreateNewTokensCommand)
export class CreateNewTokensUseCase
  implements ICommandHandler<CreateNewTokensCommand>
{
  constructor(
    private readonly authCommandRepository: AuthCommandRepository,
    private readonly authService: AuthService,
  ) {}

  async execute({ dto }: CreateNewTokensCommand): Promise<any> {
    const { user } = dto;

    const session: object | null =
      await this.authCommandRepository.findSessionByIatAndDeviceId(
        user.iat,
        user.deviceId,
      );
    if (!session) throw new UnauthorizedException('Session not found');

    const tokens: {
      accessToken: string;
      refreshToken: string;
      tokenData: { iat: Date; exp: Date; deviceId: string };
    } | null = await this.authService.createAccessAndRefreshTokens(
      user.userId,
      user.deviceId,
    );

    await this.authCommandRepository.updateIat(
      // @ts-expect-error: fix after migrate typeorm
      session.id,
      tokens!.tokenData.iat,
    );

    return tokens;
  }
}

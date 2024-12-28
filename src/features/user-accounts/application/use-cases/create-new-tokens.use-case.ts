import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AuthUpdateSessionDto} from "../../dto/auth-refresh-token.dto";
import {AuthRepository} from "../../infrastructure/auth.repository";
import {SessionDocument} from "../../domain/sessions.entity";
import {UnauthorizedException} from "@nestjs/common";
import {AuthService} from "../auth.service";

export class CreateNewTokensCommand {
  constructor(
    public readonly dto : AuthUpdateSessionDto
  ) {}
}

@CommandHandler(CreateNewTokensCommand)
export class CreateNewTokensUseCase implements ICommandHandler<CreateNewTokensCommand> {
  constructor(private readonly authRepository: AuthRepository,
              private readonly authService: AuthService,) {}

  async execute( { dto }: CreateNewTokensCommand): Promise<any> {
    const { user } = dto;

    const session: SessionDocument | null = await this.authRepository.findSessionByIatAndDeviceId(user.iat, user.deviceId)
    if (!session) throw new UnauthorizedException("Session not found");

    const tokens: {
      accessToken: string;
      refreshToken: string;
      tokenData: { iat: Date; exp: Date; deviceId: string };
    } | null = await this.authService.createAccessAndRefreshTokens(
      user.userId,
      user.deviceId,
    );

    session.updateIat(tokens!.tokenData.iat)
    session.save()

    return tokens;

  }
}
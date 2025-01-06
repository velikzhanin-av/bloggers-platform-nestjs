import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../domain/users.entity';
import {
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../../domain/sessions.entity';
import { UsersCommandRepository } from '../../infrastructure/postgresql/users-command.repository';
import { BcryptService } from '../bcrypt.service';
import { AuthService } from '../auth.service';
import { InjectModel } from '@nestjs/mongoose';

export class LoginUserCommand {
  constructor(
    public readonly dto: {
      loginOrEmail: string;
      password: string;
      userAgent: string;
      ip: string;
    },
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @InjectModel(Session.name)
    private readonly SessionModel: SessionModelType,
    private readonly UsersCommandRepository: UsersCommandRepository,
    private readonly bcryptService: BcryptService,
    private readonly authService: AuthService,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<any> {
    const { loginOrEmail, password, userAgent, ip } = dto;
    const user: UserDocument | null =
      await this.UsersCommandRepository.findByLoginOrEmail(loginOrEmail);
    if (!user)
      throw new UnauthorizedException('login/email or password is wrong');

    if (!(await this.bcryptService.checkPassword(password, user.passwordHash)))
      throw new UnauthorizedException('login/email or password is wrong');

    const userId: string = user._id.toString();
    const deviceId: string = randomUUID();

    const tokens: {
      accessToken: string;
      refreshToken: string;
      tokenData: { iat: Date; exp: Date; deviceId: string };
    } | null = await this.authService.createAccessAndRefreshTokens(
      userId,
      deviceId,
    );
    if (!tokens)
      throw new ForbiddenException('login/email or password is wrong');

    const { iat, exp } = tokens.tokenData;
    // const resultAccessToken: number =
    //   await this.UsersCommandRepository.addJwtToken(userId, tokens.accessToken);
    // const resultRefreshToken: number =
    //   await this.UsersCommandRepository.addRefreshToken(
    //     userId,
    //     tokens.refreshToken,
    //   );
    // if (!resultAccessToken || !resultRefreshToken)
    //   throw new InternalServerErrorException('internal server error');

    const session: SessionDocument = this.SessionModel.createInstance({
      userId,
      deviceId,
      iat,
      exp,
      ip: ip,
      deviceName: userAgent,
    });
    await session.save();

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: session._id.toString(),
      deviceId,
    };
  }
}

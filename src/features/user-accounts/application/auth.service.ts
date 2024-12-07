import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserDocument } from '../domain/users.entity';
import { AuthLoginDto } from '../dto/auth-login.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from './bcrypt.service';
import { randomUUID } from 'crypto';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
  ) {}

  async login(dto: AuthLoginDto): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findByLoginOrEmail(dto.loginOrEmail);
    if (!user) throw new ForbiddenException('login/email or password is wrong');

    if (
      !(await this.bcryptService.checkPassword(dto.password, user.passwordHash))
    )
      throw new ForbiddenException('login/email or password is wrong');

    const userId: string = user._id.toString();
    const deviceId: string = randomUUID();

    const tokens:
      | {
          accessToken: string;
          refreshToken: string;
          tokenData: { iat: Date; exp: Date; deviceId: string };
        }
      | undefined = await this.createAccessAndRefreshTokens(
      user._id.toString(),
      deviceId,
    );
    if (!tokens) return;
    //
    //     const iat: Date = tokens.tokenData.iat
    //     const exp: Date = tokens.tokenData.exp
    //     const resultAccessToken = await usersRepository.addJwtToken(user._id, tokens.accessToken )
    //     const resultRefreshToken = await usersRepository.addRefreshToken(user._id, tokens.refreshToken )
    //     if (!resultAccessToken || !resultRefreshToken) return false
    //     const resultCreateSession = await authRepository.createSession({userId,
    //       deviceId,
    //       iat,
    //       exp,
    //       ip: data.ip,
    //       deviceName: data.userAgent
    //     })
    //     if (resultCreateSession) {
    //       return {accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, sessionId: resultCreateSession.insertedId.toString(), deviceId}
    //     } else return false
    //   } else return false
  }

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

    if (!tokenData)
      // TODO: что возращать?
      throw new ForbiddenException('login/email or password is wrong');
    return { accessToken, refreshToken, tokenData };
  }
}

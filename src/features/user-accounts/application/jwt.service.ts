import jwt from 'jsonwebtoken';
import { Config } from '../../../config/config';
import { UsersRepository } from '../infrastructure/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomJwtService {
  constructor(private usersRepository: UsersRepository) {}

  async createJwt(userId: string, deviceId: string) {
    return jwt.sign({ userId, deviceId }, Config.TOKEN_SECRET_KEY, {
      expiresIn: Config.ACCESS_TOKEN_TTL,
    });
  }

  // async verify(token: string) {
  //   try {
  //     jwt.verify(token, Config.TOKEN_SECRET_KEY);
  //   } catch (err) {
  //     return;
  //   }
  //   return await this.usersRepository.verifyJwtToken(token);
  // }

  // async verifyRefreshToken(token: string) {
  //   try {
  //     jwt.verify(token, Config.TOKEN_SECRET_KEY);
  //   } catch (err) {
  //     return;
  //   }
  //
  //   return await this.usersRepository.verifyRefreshToken(token);
  // }

  async createRefreshToken(userId: string, deviceId: string) {
    return jwt.sign({ userId, deviceId }, Config.TOKEN_SECRET_KEY, {
      expiresIn: Config.REFRESH_TOKEN_TTL,
    });
  }

  async getDataFromJwtToken(token: string): Promise<{
    iat: Date;
    exp: Date;
    deviceId: string;
  } | null> {
    const decode = jwt.decode(token) as jwt.JwtPayload;
    if (!decode || !decode.iat || !decode.exp || !decode.deviceId) {
      return null;
    }
    const iat: Date = new Date(decode.iat * 1000); // Преобразуем в дату
    const exp: Date = new Date(decode.exp * 1000); // Преобразуем в дату
    return { iat, exp, deviceId: decode.deviceId };
  }
}

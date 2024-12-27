import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Config } from '../../config/config';
import { UserContext } from '../dto/user-context';
import {Inject} from "@nestjs/common";
import {ACCESS_TOKEN_STRATEGY_INJECT_TOKEN} from "../../features/user-accounts/constants/auth-tokens.inject-constants";
import {JwtService} from "@nestjs/jwt";
import {CoreConfig} from "../core.config";

export class JwtAuthGuard extends PassportStrategy(Strategy) {
  constructor(private readonly coreConfig: CoreConfig,) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '123',
    });
  }
  async validate(payload: UserContext): Promise<UserContext> {
    console.log(payload);
    return payload;
  }
}

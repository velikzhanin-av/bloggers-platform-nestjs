import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Config } from '../../config/config';
import { UserContext } from '../dto/user-context';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Config.TOKEN_SECRET_KEY,
    });
  }
  async validate(payload: UserContext): Promise<UserContext> {
    return payload;
  }
}

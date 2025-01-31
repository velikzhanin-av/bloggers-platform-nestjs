import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility } from '../setup/config-validation.utility';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  constructor(private configService: ConfigService<any, true>) {
    configValidationUtility.validateConfig(this);
    console.log(`ENVIRONMENT: ${this.env}`);
  }

  @IsEnum(Environments, {
    message:
      'Ser correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: string = this.configService.get('NODE_ENV');

  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number = Number(this.configService.get('PORT'));

  @IsNotEmpty({
    message:
      'Set Env variable MONGO_URI, example: mongodb://localhost:27017/my-app-local-db',
  })
  dbURI: string = this.configService.get('MONGO_URI');

  @IsNotEmpty({
    message:
      'Set Env variable ACCESS_TOKEN_SECRET_KEY, dangerous for security!',
  })
  accessTokenSecret: string = this.configService.get<string>(
    'ACCESS_TOKEN_SECRET_KEY',
  );

  @IsNotEmpty({
    message:
      'Set Env variable REFRESH_TOKEN_SECRET_KEY, dangerous for security!',
  })
  refreshTokenSecret: string = this.configService.get<string>(
    'REFRESH_TOKEN_SECRET_KEY',
  );

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_TTL, example: 10sec, 20min',
  })
  accessTokenExpiresIn: string =
    this.configService.get<string>('ACCESS_TOKEN_TTL');

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_TTL, example: 10sec, 20min',
  })
  refreshTokenExpiresIn: string =
    this.configService.get<string>('REFRESH_TOKEN_TTL');

  @IsNotEmpty({
    message: 'Set Env variable GMAIL_PASS, dangerous for security!',
  })
  mailPassword: string = this.configService.get<string>('GMAIL_PASS');
}

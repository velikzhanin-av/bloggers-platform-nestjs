import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/users.entity';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { Session, SessionSchema } from './domain/sessions.entity';
import { AuthController } from './api/auth.controller';
import { AuthRepository } from './infrastructure/auth.repository';
import { AuthService } from './application/auth.service';
import { BcryptService } from './application/bcrypt.service';
import { CustomJwtService } from './application/jwt.service';
import { JwtStrategy } from '../../core/guards/jwt.strategy';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RegistrationConfirmationUseCase } from './application/use-cases/registration-confirmation.use-case';
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.use-case';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN
} from "./constants/auth-tokens.inject-constants";
import {CoreConfig} from "../../core/core.config";
import {CreateNewTokensUseCase} from "./application/use-cases/create-new-tokens.use-case";

const useCases: Array<any> = [
  CreateUserUseCase,
  RegisterUserUseCase,
  DeleteUserUseCase,
  LoginUserUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  CreateNewTokensUseCase,
];

const services: Array<any> = [
  BcryptService,
  CustomJwtService,
  AuthService,
  JwtService,
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    NotificationsModule,
    CqrsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersRepository,
    UsersQueryRepository,
    AuthRepository,
    AuthQueryRepository,
    JwtStrategy,
    CustomJwtService,
    ...useCases,
    ...services,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (
        coreConfig: CoreConfig,
      ): JwtService => {
        return new JwtService({
          secret: coreConfig.accessTokenSecret,
          signOptions: { expiresIn: coreConfig.accessTokenExpiresIn },
        });
      },
      inject: [CoreConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (
        coreConfig: CoreConfig,
      ): JwtService => {
        return new JwtService({
          secret: coreConfig.refreshTokenSecret,
          signOptions: { expiresIn: coreConfig.refreshTokenExpiresIn },
        });
      },
      inject: [CoreConfig],
    },
  ],
  exports: [MongooseModule, UsersRepository, ACCESS_TOKEN_STRATEGY_INJECT_TOKEN],
})
export class UserAccountsModule {}

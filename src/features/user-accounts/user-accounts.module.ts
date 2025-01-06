import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/users.entity';
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
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { CoreConfig } from '../../core/core.config';
import { CreateNewTokensUseCase } from './application/use-cases/create-new-tokens.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SecurityDevicesController } from './api/security-devices.controller';
import { DeleteSessionByDeviceIdUseCase } from './application/use-cases/delete-session-by-deviceId.use-case';
import { DeleteAllSessionsExceptCurrentUseCase } from './application/use-cases/delete-all-sessions-except-current.use-case';
import { UsersQueryRepository } from './infrastructure/postgresql/users.query-repository';
import { UsersCommandRepository } from './infrastructure/postgresql/users-command.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

const useCases: Array<any> = [
  CreateUserUseCase,
  RegisterUserUseCase,
  DeleteUserUseCase,
  LoginUserUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  CreateNewTokensUseCase,
  LogoutUseCase,
  DeleteSessionByDeviceIdUseCase,
  DeleteAllSessionsExceptCurrentUseCase,
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
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    UsersCommandRepository,
    UsersQueryRepository,
    AuthRepository,
    AuthQueryRepository,
    JwtStrategy,
    CustomJwtService,
    ...useCases,
    ...services,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (coreConfig: CoreConfig): JwtService => {
        return new JwtService({
          secret: coreConfig.accessTokenSecret,
          signOptions: { expiresIn: coreConfig.accessTokenExpiresIn },
        });
      },
      inject: [CoreConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (coreConfig: CoreConfig): JwtService => {
        return new JwtService({
          secret: coreConfig.refreshTokenSecret,
          signOptions: { expiresIn: coreConfig.refreshTokenExpiresIn },
        });
      },
      inject: [CoreConfig],
    },
  ],
  exports: [
    MongooseModule,
    UsersCommandRepository,
    ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  ],
})
export class UserAccountsModule {}

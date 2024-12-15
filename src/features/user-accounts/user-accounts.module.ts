import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/users.entity';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { Session, SessionSchema } from './domain/sessions.entity';
import { AuthController } from './api/auth.controller';
import { AuthRepository } from './infrastructure/auth.repository';
import { AuthService } from './application/auth.service';
import { BcryptService } from './application/bcrypt.service';
import { JwtService } from './application/jwt.service';
import { JwtStrategy } from '../../core/guards/jwt.strategy';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    NotificationsModule,
    CqrsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    AuthRepository,
    AuthQueryRepository,
    BcryptService,
    JwtService,
    JwtStrategy,
    CreateUserUseCase,
    RegisterUserUseCase,
  ],
  exports: [UsersService, MongooseModule, UsersRepository],
})
export class UserAccountsModule {}

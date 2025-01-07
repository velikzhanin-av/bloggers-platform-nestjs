import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { UsersCommandRepository } from '../../infrastructure/postgresql/users-command.repository';
import { CreateUserCommand } from './create-user.use-case';
import { randomUUID } from 'crypto';
import { UserDocument } from '../../domain/users.entity';
import { NotificationsService } from '../../../notifications/application/notifications.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { add } from 'date-fns';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private commandBus: CommandBus,
    private usersCommandRepository: UsersCommandRepository,
    private notificationsService: NotificationsService,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const doesExistByLoginOrEmail: string | null =
      await this.usersCommandRepository.doesExistByLoginOrEmail(
        dto.login,
        dto.email,
      );
    if (doesExistByLoginOrEmail)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: doesExistByLoginOrEmail,
            field: doesExistByLoginOrEmail,
          },
        ],
      });

    const userId: string = await this.commandBus.execute(
      new CreateUserCommand(dto),
    );
    const emailConfirmationCode = randomUUID();

    const user: any =
      await this.usersCommandRepository.findOrNotFoundFail(userId);
    const confirmationCodeData = {
      emailConfirmationCode,
      emailExpirationDate: add(new Date(), {
        hours: 1,
        minutes: 30,
      }),
      userId,
    };

    await this.usersCommandRepository.updateConfirmationCode(
      confirmationCodeData,
    );

    await this.notificationsService.sendEmail(
      dto.login,
      dto.email,
      emailConfirmationCode,
    );
  }
}

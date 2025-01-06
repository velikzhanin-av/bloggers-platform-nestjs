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

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private commandBus: CommandBus,
    private eventBus: EventBus,
    private UsersCommandRepository: UsersCommandRepository,
    private notificationsService: NotificationsService,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const doesExistByLoginOrEmail: string | null =
      await this.UsersCommandRepository.doesExistByLoginOrEmail(
        dto.login,
        dto.email,
      );
    if (doesExistByLoginOrEmail)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: doesExistByLoginOrEmail,
            field: 'code',
          },
        ],
      });

    const userId: string = await this.commandBus.execute(
      new CreateUserCommand(dto),
    );
    const confirmationCode = randomUUID();

    const user: UserDocument | null =
      await this.UsersCommandRepository.findOrNotFoundFail(userId);
    user!.setConfirmationCode(confirmationCode);
    await this.UsersCommandRepository.save(user!);

    await this.notificationsService.sendEmail(
      dto.login,
      dto.email,
      confirmationCode,
    );
  }
}

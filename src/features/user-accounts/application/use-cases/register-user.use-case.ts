import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CreateUserCommand } from './create-user.use-case';
import { randomUUID } from 'crypto';
import { UserDocument } from '../../domain/users.entity';
import { NotificationsService } from '../../../notifications/application/notifications.service';
import { CreateUserDto } from '../../dto/create-user.dto';

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
    private usersRepository: UsersRepository,
    private notificationsService: NotificationsService,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    await this.usersRepository.doesExistByLoginOrEmail(dto.login, dto.email);

    const userId: string = await this.commandBus.execute(
      new CreateUserCommand(dto),
    );
    const confirmationCode = randomUUID();

    const user: UserDocument | null =
      await this.usersRepository.findOrNotFoundFail(userId);
    user!.setConfirmationCode(confirmationCode);
    await this.usersRepository.save(user!);

    await this.notificationsService.sendEmail(
      dto.login,
      dto.email,
      confirmationCode,
    );

    // const createdUserId = await this.commandBus.execute<
    //   CreateUserCommand,
    //   string
    // >(new CreateUserCommand(dto));
    //
    // const confirmCode = 'uuid';
    //
    // const user = await this.usersRepository.findOrNotFoundFail(createdUserId);
    //
    // user.setConfirmationCode(confirmCode);
    // await this.usersRepository.save(user);
    //
    // this.eventBus.publish(new UserRegisteredEvent(user.email, confirmCode));
  }
}

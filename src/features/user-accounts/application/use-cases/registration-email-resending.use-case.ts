import { AuthRegistrationEmailResendingDto } from '../../api/input-dto/auth-registration-email-resending.dtp';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../domain/users.entity';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { randomUUID } from 'crypto';
import { NotificationsService } from '../../../notifications/application/notifications.service';

export class RegistrationEmailResendingCommand {
  constructor(public dto: AuthRegistrationEmailResendingDto) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute({ dto }: RegistrationEmailResendingCommand): Promise<void> {
    const user: UserDocument = await this.usersRepository.findUserByEmail(
      dto.email,
    );
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'email',
          },
        ],
      });
    }

    const newConfirmationCode = randomUUID();
    user.setConfirmationCode(newConfirmationCode);
    await this.usersRepository.save(user);

    await this.notificationsService.sendEmail(
      user.login,
      user.email,
      newConfirmationCode,
    );
  }
}

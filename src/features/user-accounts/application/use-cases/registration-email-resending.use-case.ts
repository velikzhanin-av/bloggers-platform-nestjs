import { AuthRegistrationEmailResendingDto } from '../../api/input-dto/auth-registration-email-resending.dtp';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NotificationsService } from '../../../notifications/application/notifications.service';
import { UsersCommandRepository } from '../../infrastructure/postgresql/users-command.repository';
import { add } from 'date-fns';

export class RegistrationEmailResendingCommand {
  constructor(public dto: AuthRegistrationEmailResendingDto) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler {
  constructor(
    private readonly usersCommandRepository: UsersCommandRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute({ dto }: RegistrationEmailResendingCommand): Promise<void> {
    const user = await this.usersCommandRepository.findUserByEmail(dto.email);
    if (!user || user.isConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'email',
          },
        ],
      });
    }

    const emailConfirmationCode = randomUUID();
    const updateData = {
      emailConfirmationCode,
      emailExpirationDate: add(new Date(), {
        hours: 1,
        minutes: 30,
      }),
      userId: user.userId,
    };

    await this.usersCommandRepository.updateConfirmationCode(updateData);

    this.notificationsService.sendEmail(
      user.login,
      user.email,
      emailConfirmationCode,
    );
  }
}

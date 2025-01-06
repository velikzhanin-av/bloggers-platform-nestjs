import { AuthRegistrationEmailResendingDto } from '../../api/input-dto/auth-registration-email-resending.dtp';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../domain/users.entity';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NotificationsService } from '../../../notifications/application/notifications.service';
import { UsersCommandRepository } from '../../infrastructure/postgresql/users-command.repository';

export class RegistrationEmailResendingCommand {
  constructor(public dto: AuthRegistrationEmailResendingDto) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler {
  constructor(
    private readonly UsersCommandRepository: UsersCommandRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute({ dto }: RegistrationEmailResendingCommand): Promise<void> {
    const user: UserDocument =
      await this.UsersCommandRepository.findUserByEmail(dto.email);
    if (!user || user.emailConfirmation.isConfirmed) {
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
    await this.UsersCommandRepository.save(user);

    await this.notificationsService.sendEmail(
      user.login,
      user.email,
      newConfirmationCode,
    );
  }
}

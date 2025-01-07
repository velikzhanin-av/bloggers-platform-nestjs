import { AuthConfirmationCodeDto } from '../../api/input-dto/auth-confirmation-code.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersCommandRepository } from '../../infrastructure/postgresql/users-command.repository';

export class RegistrationConfirmationCommand {
  constructor(public dto: AuthConfirmationCodeDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(
    private readonly usersCommandRepository: UsersCommandRepository,
  ) {}

  async execute({ dto }: RegistrationConfirmationCommand): Promise<void> {
    const user = await this.usersCommandRepository.findUserByConfirmationCode(
      dto.code,
    );
    if (!user || user.isConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'code',
          },
        ],
      });
    }

    await this.usersCommandRepository.updateIsConfirmed(user.userId);
    return;
  }
}

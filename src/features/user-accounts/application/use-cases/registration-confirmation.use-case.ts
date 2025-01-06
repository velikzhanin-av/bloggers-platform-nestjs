import { AuthConfirmationCodeDto } from '../../api/input-dto/auth-confirmation-code.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../domain/users.entity';
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
    private readonly UsersCommandRepository: UsersCommandRepository,
  ) {}

  async execute({ dto }: RegistrationConfirmationCommand): Promise<void> {
    const user: UserDocument | null =
      await this.UsersCommandRepository.findUserByConfirmationCode(dto.code);
    if (!user || user.emailConfirmation.isConfirmed)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'code',
          },
        ],
      });

    user.confirmEmail();
    await this.UsersCommandRepository.save(user);
    return;
  }
}

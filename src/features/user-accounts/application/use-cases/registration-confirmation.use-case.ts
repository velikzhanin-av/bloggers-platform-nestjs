import { AuthConfirmationCodeDto } from '../../api/input-dto/auth-confirmation-code.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../domain/users.entity';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';

export class RegistrationConfirmationCommand {
  constructor(public dto: AuthConfirmationCodeDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ dto }: RegistrationConfirmationCommand): Promise<void> {
    const user: UserDocument =
      await this.usersRepository.findUserByConfirmationCode(dto.code);
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'code',
          },
        ],
      });
    }

    user.confirmEmail();
    await this.usersRepository.save(user);
    return;
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserContext } from '../../../../core/dto/user-context';
import { AuthCommandRepository } from '../../infrastructure/postgresql/auth.command-repository';

export class LogoutCommand {
  constructor(public readonly dto: UserContext) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler {
  constructor(private readonly authCommandRepository: AuthCommandRepository) {}

  async execute({ dto }: LogoutCommand): Promise<void> {
    await this.authCommandRepository.deleteSessionByDeviceId(dto.deviceId);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserContext } from '../../../../core/dto/user-context';
import { AuthRepository } from '../../infrastructure/auth.repository';

export class LogoutCommand {
  constructor(public readonly dto: UserContext) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute({ dto }: LogoutCommand): Promise<void> {
    await this.authRepository.deleteSessionByDeviceId(dto.deviceId);
  }
}

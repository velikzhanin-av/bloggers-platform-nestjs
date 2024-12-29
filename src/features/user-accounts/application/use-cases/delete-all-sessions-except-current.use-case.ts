import { AuthRepository } from '../../infrastructure/auth.repository';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

export class DeleteAllSessionsExceptCurrentCommand implements ICommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteAllSessionsExceptCurrentCommand)
export class DeleteAllSessionsExceptCurrentUseCase implements ICommand {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(dto: DeleteAllSessionsExceptCurrentCommand): Promise<void> {
    const { userId, deviceId } = dto;
    await this.authRepository.deleteSessions(deviceId, userId);
  }
}
